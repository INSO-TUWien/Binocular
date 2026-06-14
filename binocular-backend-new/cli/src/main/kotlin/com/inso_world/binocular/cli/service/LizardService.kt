package com.inso_world.binocular.cli.service

import java.nio.file.Path
import com.inso_world.binocular.core.delegates.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.Locale
import com.inso_world.binocular.core.service.LizardFileAnalysisInfrastructurePort
import com.inso_world.binocular.model.Repository
import kotlin.math.ln
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Service for running Lizard on chosen paths *
 *
 * This service coordinates between the Git indexer (FFI layer) and the repository
 * service (persistence layer) to efficiently process data extracted by lizard. Afterwards
 * It safes the data in the database.
 *
 * The service first splits up the given path by the user. It then runs lizard on each of the
 * chosen folders. Afterwards the output from lizard  is read to create lists. These lists
 *
 * IMPORTANT to notice, if a path is given, that does not exist and lizard checks this path, then
 * it will be ignored and be logged as a warning. It is technically not wrong, just will not present
 * the wanted data.
 *
 * ## Example Usage
 * ```kotlin
 * lizardService.runLizard("/path/to/repo", "folder1, folder2, folder3", 2)
 * ```
 */

@Service
class LizardService(
    @Autowired private val lizardFileAnalysisPort: LizardFileAnalysisInfrastructurePort,
)
{
    companion object {
        private val logger by logger()
    }

    /**
     * Removes any path that does not exist in the project, relative tot he repoPath.
     * Ensures that only folders that were given are looked at by lizard, if they
     * really exist. Prevents lizard from creating empty folders.
     *
     * @param repoPath The "root" path for lizard to start looking for folders.
     * @param lizardInclude the actual path relative to the root path for the folders for lizard to run on.
     */
    fun removeNonexistendPaths(
        repoPath: String?,
        lizardInclude: String?,
    ): List<String> {
        val listOfPaths  = lizardInclude?.split(",")?.map{it.trim()}?.filter{it.isNotEmpty()}?.distinct()?:listOf("backend/src", "frontend/src")

        val includeListOfPathsCleaned = mutableListOf<String>()

        listOfPaths.forEach { includePath ->

            val includePathCleaned = Path.of(repoPath, includePath).normalize().toAbsolutePath()

            if (!includePathCleaned.toFile().isDirectory) {
                logger.warn("Skipping Lizard path because it is not a directory: {}", includePathCleaned)
                return@forEach
            }

            includeListOfPathsCleaned.add(includePath)

        }

        return removeSubPaths(includeListOfPathsCleaned)

    }

    /**
     * Removes any child path, to ensure that each file is only looked at once and not multiple times
     *
     * @param paths the paths given after removing duplicates or non existent paths
     *
     */
    private fun removeSubPaths(
        paths: List<String>
    ): List<String> {
        val sortedPaths = paths.map{it.trim().replace("\\", "/").trimEnd('/')}.sortedBy{it.length}

        val result = mutableListOf<String>()

        sortedPaths.forEach { currentPath ->
            var isSubPath = false

            for (existingPath in result) {
                if (currentPath == existingPath || currentPath.startsWith("$existingPath/")) {
                    isSubPath = true
                    break
                }
            }

            if (!isSubPath) {
                result.add(currentPath)
            } else {
                logger.debug("Skipping Lizard path because this: {} is a child path of another path", currentPath)
            }

        }

        logger.debug("Successfully removed any sub path")

        return result
    }

    /**
     * Runs lizard on given folders. Creates output files, including the name of the path that the folder is at.
     * Output files are put into the root of given repopath. Creates one CSV file for each folder given by the user.
     *
     * @param repoPath The "root" path for lizard to start looking for folders.
     * @param lizardInclude the actual path relative to the root path for the folders for lizard to run on.
     * @param threads the amount of threads for lizard to run when executed
     *
     */
    fun runLizard(
        repoPath: String?,
        lizardInclude: List<String>,
        threads: Int,
    ){
        val normalizedRepoPath = Path.of(repoPath).toRealPath().toString()

        lizardInclude.forEach { includePath->

            val safeFileEnding = includePath.replace("/", "_")

            val outputFileName = "analysis_$safeFileEnding.csv"

            val lizardCommand = mutableListOf(
                "docker",
                "run",
                "--rm",
                "-v",
                "$normalizedRepoPath:/lizard",
                "-w",
                "/lizard/$includePath",
                "lizard-analyser",
                "--csv",
                "-o",
                "/lizard/$outputFileName",
                "-t",
                threads.toString(),
                ".",
            )

            logger.debug("Running Lizard for path {}: {}", includePath, lizardCommand.joinToString(" "))

            val process = ProcessBuilder(lizardCommand)
                .redirectOutput(ProcessBuilder.Redirect.INHERIT)
                .redirectError(ProcessBuilder.Redirect.INHERIT)
                .start()

            val exitCode = process.waitFor()

            if(exitCode != 0) {
                logger.debug("Lizard FAILED for path: {}", includePath)
            } else {
                logger.debug("Lizard finished for path: {}", includePath)
            }

        }

    }

    /**
     * Inputs the data from csv files created by lizard. Inputs this data
     * into a single list.
     *
     * @param repoPath The "root" path for lizard to start looking for folders.
     * @param lizardInclude the actual path relative to the root path for the folders for lizard to run on. Used to find file names
     *
     */
    fun readLizardFiles(
        repoPath: String?,
        lizardInclude: List<String>,
    ): List<String> {

        val allResultsLines = mutableListOf<String>()

        lizardInclude.forEach { includePath ->

            val safeFileEnding = includePath.replace("/", "_")

            val outputFileName = "analysis_$safeFileEnding.csv"

            val csvPath = Path.of(repoPath,outputFileName)

            if(!csvPath.toFile().exists()) {
                logger.warn("Lizard CSV file does not exist: {}", csvPath)
                return@forEach
            }

            logger.debug("Reading input of Lizard CSV file: {}", csvPath)

            val lines = csvPath.toFile().readLines()

            if(lines.size <= 1) {
                logger.warn("Lizard CSV file is empty: {}", csvPath)
                return@forEach
            }

            lines.drop(0).forEach{ line ->

                if(line.isEmpty()) {
                    logger.warn("Lizard CSV file includes empty lines: {}", csvPath)
                }

                allResultsLines.add(line)

            }

        }

        logger.debug("Read total of {} lines of code", allResultsLines.size)

        val summarizedResult = summarizeLizardDataByFile(allResultsLines)

        logger.debug("Read total of {} number of files", summarizedResult.size)

        // logger.debug("Data {}: ", summarizedResult)

        deleteLizardCsvFiles(repoPath, lizardInclude)

        return summarizedResult
    }

    /**
     * By default lizard creates information for each function for each file. This function
     * adds the individual lines up for each file rather than evaluating each function by itself.
     * It creates a new list that contains 1 line for each file with all the information relative to the functions it contains
     *
     * @param lines The input read from ALL Csv files created using lizard.
     */
    private fun summarizeLizardDataByFile(
        lines: List<String>,
    ): List<String> {

        val summarizedResults = mutableListOf<String>()

        val groupedByFile = mutableMapOf<String, MutableList<List<String>>>()

        lines.forEach{ line ->

            val columns = line.split(Regex(""",(?=(?:[^"]*"[^"]*")*[^"]*$)""")).map{it.trim().removeSurrounding("\"")}

            val fileName = columns[6]

            groupedByFile.getOrPut(fileName){mutableListOf()}.add(columns)

        }

        groupedByFile.forEach{ (fileName,entries) ->

            val nlocValues = entries.map{it[0].toInt()}
            val ccnValues = entries.map{it[1].toInt()}
            val tokenValues = entries.map{it[2].toInt()}
            val parameterValues = entries.map{it[3].toInt()}
            val lengthValues = entries.map{it[4].toInt()}

            val resultLine = listOf(
                fileName,
                nlocValues.max().toString(),
                ccnValues.max().toString(),
                tokenValues.max().toString(),
                parameterValues.max().toString(),
                lengthValues.max().toString(),

                "%.2f".format(Locale.US, nlocValues.average()),
                "%.2f".format(Locale.US, ccnValues.average()),
                "%.2f".format(Locale.US, tokenValues.average()),
                "%.2f".format(Locale.US, parameterValues.average()),
                "%.2f".format(Locale.US, lengthValues.average()),
                entries.size.toString(),

            ).joinToString(",")

            summarizedResults.add(resultLine)
        }

        logger.debug("Successfully created summarized result for Lizard files.")

        return summarizedResults

    }

    /**
     * Delete all previously by runLizard created CSV files
     *
     * @param repoPath Where the lizard files got safed.
     * @param lizardInclude Used to find the csv files (naming) and deleing them
     *
     */
    private fun deleteLizardCsvFiles(
        repoPath: String?,
        lizardInclude: List<String>,
    ){
        lizardInclude.forEach{includePath ->

            val safeFileEnding = includePath.replace("/", "_")

            val outputFileName = "analysis_$safeFileEnding.csv"

            val csvPath = Path.of(repoPath,outputFileName)

            val deleted= csvPath.toFile().delete()

            if(deleted) {
                logger.debug("Successfully deleted Lizard CSV file: {}", csvPath)
            } else {
                logger.warn("Failed to delete Lizard CSV file: {}", csvPath)
            }

        }

    }


    /**
     * Processes the information from the lizard file. Evaluating the parameters created
     * by lizard. Giving each a score. Returns a list containing the scores for each of the files
     *
     * Higher score means harder to maintain.
     *
     * @param lizardData A list containing all relevant data, created and summarized information from lizard.
     */
    fun evaluateLizardData(
        lizardData: List<String>,
    ): List<String>{

        val evaluatedRows = mutableListOf<MutableList<String>>()

        var globalMaxScore = 0.0
        var globalMaxAverageScore = 0.0

        lizardData.forEach{ file ->

            val columns = file.split(Regex(""",(?=(?:[^"]*"[^"]*")*[^"]*$)""")).map{it.trim().removeSurrounding("\"")}.toMutableList()

            val maxNloc = columns[1].toDouble()
            val maxCcn = columns[2].toDouble()
            val maxTokens = columns[3].toDouble()
            val maxParameters = columns[4].toDouble()
            val maxLength = columns[5].toDouble()

            val avgNloc = columns[6].toDouble()
            val avgCcn = columns[7].toDouble()
            val avgTokens = columns[8].toDouble()
            val avgParameters = columns[9].toDouble()
            val avgLength = columns[10].toDouble()

            val maxCommentRation = (maxLength - maxNloc) / maxLength
            val maxHalsteadVolumeApproximation = maxTokens * (ln(maxTokens + maxParameters + 1.0) / ln(2.0))

            val avgCommentRation = (avgLength - avgNloc) / avgLength
            val avgHalsteadVolumeApproximation = avgTokens * (ln(avgTokens + avgParameters + 1.0) / ln(2.0))

            /**
             * Formula adapted from Oman et al.
             * https://www.researchgate.net/publication/2954310_Using_Metrics_to_Evaluate_Software_System_Maintainability
             *
             * Removed the offset of 171
             * Inverted the signs
             */

            val maxScore =
                    (5.2 * ln(maxHalsteadVolumeApproximation)
                     + 0.23 * maxCcn
                     + 16.2 * ln(maxLength)
                     - 50 * sin(sqrt(2.4 * maxCommentRation)))

            val avgScore =
                    (5.2 * ln(avgHalsteadVolumeApproximation)
                     + 0.23 * avgCcn
                     + 16.2 * ln(avgLength)
                     - 50 * sin(sqrt(2.4 * avgCommentRation)))

            if (maxScore > globalMaxScore) {
                globalMaxScore = maxScore
            }

            if (avgScore > globalMaxAverageScore) {
                globalMaxAverageScore = avgScore
            }

            columns.add("%.2f".format(Locale.US, maxScore))
            columns.add("%.2f".format(Locale.US, avgScore))

            evaluatedRows.add(columns)
        }

        val processedData = mutableListOf<String>()

        evaluatedRows.forEach { columns ->

            val maxScore = columns[12].toDouble()
            val avgScore = columns[13].toDouble()

            val normalizedMaxScore =
                if (globalMaxScore == 0.0){
                    0.0
                } else {
                    maxScore / globalMaxScore
                }

            val normalizedAvgScore =
                if (globalMaxAverageScore == 0.0){
                    0.0
                } else {
                    avgScore / globalMaxAverageScore
                }

            columns.add("%.4f".format(Locale.US, normalizedMaxScore))
            columns.add("%.4f".format(Locale.US, normalizedAvgScore))

            processedData.add(columns.joinToString(","))
        }

        logger.debug("Successfully processed data and added lizard score")

        return processedData
    }

    /**
     * Saves the processed Lizarddata to the database.
     *
     * @param repository The Repostiroy saved earlier in the VCSservice
     * @param lizardData the processedd Data given as an array
     */
    fun saveLizardData(
        repository: Repository,
        lizardData: List<String>,
    ) {
        val repositoryId = requireNotNull(repository.id?.toLongOrNull())

        val rows = lizardData.map { row ->
            row.split(",").map{it.trim()}
        }

        lizardFileAnalysisPort.saveAllRows(repositoryId, rows)

        logger.debug("Successfully saved all Lizard Data")
    }


}
