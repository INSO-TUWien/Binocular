package com.inso_world.binocular.model

import com.inso_world.binocular.model.vcs.Remote
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import kotlin.uuid.Uuid

class RemoteModelTest {
    private lateinit var repository: Repository
    private lateinit var project: Project

    @BeforeEach
    fun setup() {
        project = Project(name = "test-project")
        repository = Repository(localPath = "test-repo", projectId = project.iid)
    }

    @Nested
    inner class Construction {
        @Test
        fun `create remote with valid name and url, should succeed`() {
            val remote = Remote(name = "origin", url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            assertThat(remote.name).isEqualTo("origin")
            assertThat(remote.url).isEqualTo("https://github.com/test/repo.git")
            assertThat(remote.repositoryId).isEqualTo(repository.iid)
        }

        @Test
        fun `create remote, check iid is set automatically`() {
            val remote = Remote(name = "origin", url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            assertThat(remote.iid).isNotNull()
        }

        @Test
        fun `create remote, check id is null by default`() {
            val remote = Remote(name = "origin", url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            assertThat(remote.id).isNull()
        }

        @ParameterizedTest
        @ValueSource(strings = ["origin", "upstream", "custom-remote", "remote_123"])
        fun `create remote with valid names, should succeed`(name: String) {
            val remote = Remote(name = name, url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            assertThat(remote.name).isEqualTo(name)
        }

        @ParameterizedTest
        @ValueSource(strings = ["", " ", "\t", "\n"])
        fun `create remote with blank name, should fail`(name: String) {
            assertThrows<IllegalArgumentException> {
                Remote(name = name, url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            }
        }

        @ParameterizedTest
        @ValueSource(strings = ["", " ", "\t", "\n"])
        fun `create remote with blank url, should fail`(url: String) {
            assertThrows<IllegalArgumentException> {
                Remote(name = "origin", url = url, repositoryId = repository.iid)
            }
        }

        @ParameterizedTest
        @ValueSource(
            strings = [
                "https://github.com/user/repo",
                "http://github.com/user/repo.git",
                "git@github.com:user/repo.git",
                "ssh://user@host.com:port/path/to/repo.git",
                "file:///path/to/repo.git",
            ],
        )
        fun `create remote with various valid URLs, should succeed`(url: String) {
            val remote = Remote(name = "origin", url = url, repositoryId = repository.iid)
            assertThat(remote.url).isEqualTo(url)
        }
    }

    @Nested
    inner class IdentityAndEquality {
        @Test
        fun `create remote, validate uniqueKey`() {
            val remote = Remote(name = "origin", url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            val key = remote.uniqueKey
            assertThat(key.repositoryId).isEqualTo(repository.iid)
            assertThat(key.name).isEqualTo("origin")
        }

        @Test
        fun `create remote with name containing whitespace, uniqueKey should trim`() {
            val remote = Remote(name = "  origin  ", url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            assertThat(remote.uniqueKey.name).isEqualTo("origin")
        }

        @Test
        fun `create remote, validate hashCode is based on iid`() {
            val remote = Remote(name = "origin", url = "https://github.com/test/repo.git", repositoryId = repository.iid)
            assertThat(remote.hashCode()).isEqualTo(remote.iid.hashCode())
        }

        @Test
        fun `create two remotes, check they are not equal`() {
            val remote1 = Remote(name = "origin", url = "url1", repositoryId = repository.iid)
            val remote2 = Remote(name = "origin", url = "url1", repositoryId = repository.iid)

            assertThat(remote1.iid).isNotEqualTo(remote2.iid)
            assertThat(remote1.uniqueKey).isEqualTo(remote2.uniqueKey)
            assertThat(remote1).isNotEqualTo(remote2)
        }
    }

    @Nested
    inner class MutationOperations {
        @Test
        fun `create remote then modify url, expect changes to persist`() {
            val remote = Remote(name = "origin", url = "url1", repositoryId = repository.iid)
            remote.url = "url2"
            assertThat(remote.url).isEqualTo("url2")
        }

        @Test
        fun `create remote then modify database id, expect changes to persist`() {
            val remote = Remote(name = "origin", url = "url1", repositoryId = repository.iid)
            remote.id = "db-id-123"
            assertThat(remote.id).isEqualTo("db-id-123")
        }
    }
}
