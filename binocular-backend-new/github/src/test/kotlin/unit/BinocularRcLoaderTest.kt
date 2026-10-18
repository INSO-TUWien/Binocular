package unit

import com.inso_world.binocular.github.config.BinocularRcLoader
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.io.FileNotFoundException
import kotlin.test.assertEquals

/**
 * Test class for BinocularRcLoader.
 * Currently, the loader can only parse correctly formatted (aka from the old backend setup) files.
 */
class BinocularRcLoaderTest {
    @Test
    fun `should load GitHub token from binocularrc`(
        @TempDir tempDir: File
    ) {
        // create temp .binocularrc for testing
        val rcFile = File(tempDir, ".binocularrc")
        rcFile.writeText(
            """
            {
                "gitlab": {"url": "", "project": "", "token": ""},
                "github": {
                    "auth": {
                        "type": "token",
                        "username": "user",
                        "password": "",
                        "token": "TEST_TOKEN_123"
                    }
                },
                "arango": {"host": "127.0.0.1", "port": 8529, "user": "root", "password": ""},
                "indexers": {"its": "github", "ci": "github"}
            }
            """.trimIndent()
        )

        // load token
        val loader = BinocularRcLoader(rcFile.absolutePath)
        val token = loader.loadGitHubToken()

        // assert that token was correctly loaded
        assertEquals("TEST_TOKEN_123", token)
    }

    @Test
    fun `should throw exception when missing binocularrc`(
        @TempDir tempDir: File
    ) {
        val rcFile = File(tempDir, ".binocularrc")

        // load token
        val loader = BinocularRcLoader(rcFile.absolutePath)
        assertThrows<FileNotFoundException> { loader.loadGitHubToken() }
    }

    @Test
    fun `should throw exception when blank token`(
        @TempDir tempDir: File
    ) {
        val rcFile = File(tempDir, ".binocularrc")
        rcFile.writeText(
            """
            {
                "gitlab": {"url": "", "project": "", "token": ""},
                "github": {
                    "auth": {
                        "type": "token",
                        "username": "user",
                        "password": "",
                        "token": ""
                    }
                },
                "arango": {"host": "127.0.0.1", "port": 8529, "user": "root", "password": ""},
                "indexers": {"its": "github", "ci": "github"}
            }
            """.trimIndent()
        )

        // load token
        val loader = BinocularRcLoader(rcFile.absolutePath)
        assertThrows<IllegalStateException> { loader.loadGitHubToken() }
    }

    @Test
    fun `should throw exception when binocularrc has invalid format`(
        @TempDir tempDir: File
    ) {
        val rcFile = File(tempDir, ".binocularrc")
        rcFile.writeText(
            """
            {
                "gitab": {"url": "", "project": "", "token": ""},
                "gitub": {
                    "test": {
                        "type": "token",
                        "username": "user",
                        "password": "",
                        "test3": ""
                    }
                },
                "test2": {"host": "127.0.0.1", "port": 8529, "user": "root", "password": ""},
                "indexers": {"its": "github", "ci": "github"}
            }
            """.trimIndent()
        )

        // load token
        val loader = BinocularRcLoader(rcFile.absolutePath)
        assertThrows<IllegalArgumentException> { loader.loadGitHubToken() }
    }
}
