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

}
