package com.inso_world.binocular.cli.service

import java.nio.file.Path
import com.inso_world.binocular.core.delegates.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

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
class LizardService()
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
        val listOfPaths  = lizardInclude?.split(",")?.map{it.trim()}?.filter{it.isNotEmpty()}?:listOf("backend/src", "frontend/src")

        val includeListOfPathsCleaned = mutableListOf<String>()

        listOfPaths.forEach { includePath ->

            val normalizedIncludePath = includePath.replace("\\", "/")

            val includePathCleaned = Path.of(repoPath, normalizedIncludePath).normalize().toAbsolutePath()

            if (!includePathCleaned.toFile().isDirectory) {
                logger.warn("Skipping Lizard path because it is not a directory: {}", includePathCleaned)
                return@forEach
            }

            includeListOfPathsCleaned.add(normalizedIncludePath)

        }

        return includeListOfPathsCleaned

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
        val normalizedRepoPath = Path.of(repoPath).toRealPath().toString().replace("\\", "/")

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

        return allResultsLines
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

                "%.2f".format(nlocValues.average()),
                "%.2f".format(ccnValues.average()),
                "%.2f".format(tokenValues.average()),
                "%.2f".format(parameterValues.average()),
                "%.2f".format(lengthValues.average()),
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


}
