package com.inso_world.binocular.github.config

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.stereotype.Component
import java.io.File
import java.io.FileNotFoundException

// this is currently just to get the service working with the token from the .binocularrc json, not optimal
// necessary data classes have just been dumped into this class for now
// config via binocularrc file is not optimal for new backend, should instead be solved via yaml files
// TODO create github.yaml

/**
 * Component responsible for locating and parsing the `.binocularrc` configuration file.
 *
 * The binocularrc file is expected to be a JSON file containing config details such as
 * settings, tokens and credentials for indexers and GitHub/GitLab.
 */
@Component
class BinocularRcLoader(
    private val configFilePath: String? = null // optional path
) {
    fun loadConfig(): BinocularRc {
        // take file from path or else find file
        val file =
            configFilePath?.let { path ->
                val f = File(path)
                if (!f.exists()) {
                    throw FileNotFoundException(".binocularrc not found at given path: $path.")
                }
                f
            } ?: findRcFile()
        val json = file.readText()
        val mapper = jacksonObjectMapper()
        try {
            return mapper.readValue(json)
            // throw exception if binocularrc is not formatted correctly
        } catch (e: com.fasterxml.jackson.core.JsonProcessingException) {
            throw IllegalArgumentException("Failed to parse .binocularrc file: ${e.message}", e)
        }
    }

    fun loadGitHubToken(): String {
        val token = loadConfig().github.auth.token

        if (token.isBlank()) {
            throw IllegalStateException("GitHub token is empty.")
        }

        return token
    }

    private fun findRcFile(): File {
        var current = File(System.getProperty("user.dir"))
        while (current != null) {
            val rc = File(current, ".binocularrc")
            if (rc.exists()) return rc
            current = current.parentFile
        }
        throw FileNotFoundException(".binocularrc not found in any parent directories.")
    }
}

// data classes for parsing the JSON file
data class BinocularRc(
    val gitlab: GitlabConfig,
    val github: GithubConfig,
    val arango: ArangoConfig,
    val indexers: IndexersConfig
)

data class GitlabConfig(
    val url: String,
    val project: String,
    val token: String
)

data class GithubConfig(
    val auth: AuthConfig
)

data class AuthConfig(
    val type: String,
    val username: String,
    val password: String,
    val token: String
)

data class ArangoConfig(
    val host: String,
    val port: Int,
    val user: String,
    val password: String
)

data class IndexersConfig(
    val its: String,
    val ci: String
)
