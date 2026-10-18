package com.inso_world.binocular.ffi.unit.extensions

import com.inso_world.binocular.core.unit.base.BaseUnitTest
import com.inso_world.binocular.ffi.extensions.toModel
import com.inso_world.binocular.ffi.internal.GixRemote
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.vcs.Remote
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.ValueSource

@Disabled("Refactored in domain model #454")
class BinocularRemoteTest : BaseUnitTest() {
    private lateinit var project: Project
    private lateinit var repository: Repository

    @BeforeEach
    fun setUp() {
        project = Project(name = "test-project")
        repository =
            Repository(
                localPath = "/path/to/repo",
                projectId = project.iid,
            ).apply { this.project = project }
    }

    @Nested
    inner class RemoteCreation {
        @Test
        fun `toModel creates new remote when no existing remote matches`() {
            // Verifies that a new remote is created with all properties set correctly
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result).isNotNull },
                { assertThat(result.name).isEqualTo("origin") },
                { assertThat(result.url).isEqualTo("https://github.com/user/repo.git") },
                { assertThat(result.repository).isSameAs(repository) },
            )
        }

        @Test
        fun `toModel registers new remote in repository remotes collection`() {
            // Ensures newly created remote is automatically added to repository's remote collection
            val ffiRemote =
                GixRemote(
                    name = "upstream",
                    url = "https://github.com/upstream/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(repository.remotes).contains(result) },
                { assertThat(repository.remotes).hasSize(1) },
            )
        }

        @Test
        fun `toModel creates remote with specified name and url`() {
            // Validates that FFI remote name and URL are correctly transferred to domain model
            val ffiRemote =
                GixRemote(
                    name = "fork",
                    url = "https://github.com/fork/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result.name).isEqualTo("fork") },
                { assertThat(result.url).isEqualTo("https://github.com/fork/repo.git") },
            )
        }
    }

    @Nested
    inner class IdentityPreservation {
        @Test
        fun `toModel returns existing remote when name matches exactly`() {
            val existingRemote =
                Remote(
                    name = "origin",
                    url = "https://github.com/user/repo.git",
                    repositoryId = repository.iid,
                ).apply { this.repository = repository }

            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result).isSameAs(existingRemote)
        }

        @Test
        fun `toModel does not create duplicate remotes for same name`() {
            val ffiRemote1 =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo1.git",
                )
            val ffiRemote2 =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo2.git",
                )

            val result1 = ffiRemote1.toModel(repository.iid)
            val result2 = ffiRemote2.toModel(repository.iid)

            assertAll(
                { assertThat(result1).isSameAs(result2) },
                { assertThat(repository.remotes).hasSize(1) },
            )
        }

        @Test
        fun `toModel correctly identifies remote among multiple remotes`() {
            val remote1 =
                Remote(name = "origin", url = "https://github.com/user/repo.git", repositoryId = repository.iid).apply {
                    this.repository =
                        repository
                }
            val remote2 =
                Remote(name = "upstream", url = "https://github.com/upstream/repo.git", repositoryId = repository.iid).apply {
                    this.repository =
                        repository
                }
            val remote3 =
                Remote(name = "fork", url = "https://github.com/fork/repo.git", repositoryId = repository.iid).apply {
                    this.repository =
                        repository
                }

            val ffiRemote =
                GixRemote(
                    name = "upstream",
                    url = "https://github.com/different/url.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result).isSameAs(remote2) },
                { assertThat(repository.remotes).hasSize(3) }, // No new remote added
            )
        }

        @Test
        fun `toModel creates new remote when no match among existing remotes`() {
            Remote(name = "origin", url = "https://github.com/user/repo.git", repositoryId = repository.iid).apply {
                this.repository =
                    repository
            }
            Remote(name = "upstream", url = "https://github.com/upstream/repo.git", repositoryId = repository.iid).apply {
                this.repository =
                    repository
            }

            val ffiRemote =
                GixRemote(
                    name = "fork",
                    url = "https://github.com/fork/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result.name).isEqualTo("fork") },
                { assertThat(repository.remotes).hasSize(3) },
            )
        }
    }

    // ========== URL Update Logic ==========

    @Nested
    inner class UrlUpdate {
        @Test
        fun `toModel updates url when existing remote has different url`() {
            val existingRemote =
                Remote(
                    name = "origin",
                    url = "https://github.com/user/old-repo.git",
                    repositoryId = repository.iid,
                ).apply { this.repository = repository }
            assertThat(existingRemote.url).isEqualTo("https://github.com/user/old-repo.git")

            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/new-repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result).isSameAs(existingRemote) },
                { assertThat(result.url).isEqualTo("https://github.com/user/new-repo.git") },
                { assertThat(result.url).isNotEqualTo("https://github.com/user/old-repo.git") },
            )
        }

        @Test
        fun `toModel does not update url when it is already the same`() {
            val existingRemote =
                Remote(
                    name = "origin",
                    url = "https://github.com/user/repo.git",
                    repositoryId = repository.iid,
                ).apply { this.repository = repository }

            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result).isSameAs(existingRemote) },
                { assertThat(result.url).isEqualTo("https://github.com/user/repo.git") },
            )
        }

        @Test
        fun `toModel updates url multiple times on repeated calls with different urls`() {
            val existingRemote =
                Remote(
                    name = "origin",
                    url = "https://github.com/user/repo1.git",
                    repositoryId = repository.iid,
                ).apply { this.repository = repository }

            val ffiRemote = GixRemote(name = "origin", url = "")

            // First update
            ffiRemote.url = "https://github.com/user/repo2.git"
            val result1 = ffiRemote.toModel(repository.iid)
            assertThat(result1.url).isEqualTo("https://github.com/user/repo2.git")

            // Second update
            ffiRemote.url = "https://github.com/user/repo3.git"
            val result2 = ffiRemote.toModel(repository.iid)
            assertThat(result2.url).isEqualTo("https://github.com/user/repo3.git")

            assertAll(
                { assertThat(result1).isSameAs(existingRemote) },
                { assertThat(result2).isSameAs(existingRemote) },
            )
        }

        @Test
        fun `toModel updates url from http to https`() {
            val existingRemote =
                Remote(
                    name = "origin",
                    url = "http://github.com/user/repo.git",
                    repositoryId = repository.iid,
                ).apply { this.repository = repository }

            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result).isSameAs(existingRemote) },
                { assertThat(result.url).isEqualTo("https://github.com/user/repo.git") },
            )
        }

        @Test
        fun `toModel updates url from ssh to https`() {
            val existingRemote =
                Remote(
                    name = "origin",
                    url = "ssh://git@github.com/user/repo.git",
                    repositoryId = repository.iid,
                ).apply { this.repository = repository }

            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result).isSameAs(existingRemote) },
                { assertThat(result.url).isEqualTo("https://github.com/user/repo.git") },
            )
        }
    }

    // ========== Standard Git Remote Names ==========

    @Nested
    inner class StandardRemoteNames {
        @ParameterizedTest
        @ValueSource(
            strings = [
                "origin",
                "upstream",
                "fork",
                "backup",
                "mirror",
                "production",
                "staging",
                "development",
            ],
        )
        fun `toModel handles common Git remote names`(remoteName: String) {
            val ffiRemote =
                GixRemote(
                    name = remoteName,
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo(remoteName)
        }

        @Test
        fun `toModel handles remote name with hyphen`() {
            val ffiRemote =
                GixRemote(
                    name = "origin-https",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo("origin-https")
        }

        @Test
        fun `toModel handles remote name with underscore`() {
            val ffiRemote =
                GixRemote(
                    name = "origin_ssh",
                    url = "ssh://git@github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo("origin_ssh")
        }

        @Test
        fun `toModel handles remote name with dot`() {
            val ffiRemote =
                GixRemote(
                    name = "origin.backup",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo("origin.backup")
        }

        @Test
        fun `toModel handles remote name with slash`() {
            val ffiRemote =
                GixRemote(
                    name = "team/fork",
                    url = "https://github.com/team/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo("team/fork")
        }
    }

    // ========== URL Protocol Support ==========

    @Nested
    inner class UrlProtocols {
        @ParameterizedTest
        @CsvSource(
            "'origin', 'https://github.com/user/repo.git'",
            "'upstream', 'http://github.com/user/repo.git'",
            "'ssh-remote', 'ssh://git@github.com/user/repo.git'",
            "'git-remote', 'git://github.com/user/repo.git'",
            "'file-remote', 'file:///path/to/repo.git'",
            "'scp-remote', 'git@github.com:user/repo.git'",
            "'local-abs', '/path/to/local/repo'",
            "'local-rel', '../relative/repo'",
            "'local-cur', './current/repo'",
        )
        fun `toModel supports various Git URL protocols`(
            name: String,
            url: String,
        ) {
            val ffiRemote = GixRemote(name = name, url = url)

            val result = ffiRemote.toModel(repository.iid)

            assertAll(
                { assertThat(result.name).isEqualTo(name) },
                { assertThat(result.url).isEqualTo(url) },
            )
        }

        @Test
        fun `toModel handles GitHub HTTPS URL`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repository.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://github.com/user/repository.git")
        }

        @Test
        fun `toModel handles GitLab HTTPS URL`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://gitlab.com/group/project.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://gitlab.com/group/project.git")
        }

        @Test
        fun `toModel handles Bitbucket HTTPS URL`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://bitbucket.org/team/repository.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://bitbucket.org/team/repository.git")
        }

        @Test
        fun `toModel handles SSH URL with git user`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "ssh://git@github.com:22/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("ssh://git@github.com:22/user/repo.git")
        }

        @Test
        fun `toModel handles URL with port number`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://example.com:8080/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://example.com:8080/user/repo.git")
        }

        @Test
        fun `toModel handles URL with authentication credentials`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://user:token@github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://user:token@github.com/user/repo.git")
        }

        @Test
        fun `toModel handles URL with query parameters`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo.git?param=value",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://github.com/user/repo.git?param=value")
        }

        @Test
        fun `toModel handles URL with fragment`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo.git#fragment",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://github.com/user/repo.git#fragment")
        }

        @Test
        fun `toModel handles SCP-like SSH syntax for GitHub`() {
            // Tests the git@host:path format commonly used for SSH
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "git@github.com:user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("git@github.com:user/repo.git")
        }

        @Test
        fun `toModel handles SCP-like SSH syntax for GitLab`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "git@gitlab.com:group/project.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("git@gitlab.com:group/project.git")
        }

        @Test
        fun `toModel handles SCP-like SSH syntax with custom user`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "deploy@server.example.com:repos/app.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("deploy@server.example.com:repos/app.git")
        }

        @Test
        fun `toModel handles absolute local path`() {
            // Tests absolute filesystem paths
            val ffiRemote =
                GixRemote(
                    name = "local",
                    url = "/path/to/local/repository",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("/path/to/local/repository")
        }

        @Test
        fun `toModel handles relative path with parent directory`() {
            // Tests ../ relative paths
            val ffiRemote =
                GixRemote(
                    name = "sibling",
                    url = "../sibling-repo",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("../sibling-repo")
        }

        @Test
        fun `toModel handles relative path with current directory`() {
            // Tests ./ relative paths
            val ffiRemote =
                GixRemote(
                    name = "local",
                    url = "./local/repo",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("./local/repo")
        }

        @Test
        fun `toModel handles simple relative path`() {
            // Tests simple relative paths without ./ prefix
            val ffiRemote =
                GixRemote(
                    name = "local",
                    url = "relative/path/to/repo",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("relative/path/to/repo")
        }
    }

    // ========== Edge Cases ==========

    @Nested
    inner class EdgeCases {
        @Test
        fun `toModel handles minimal valid remote name`() {
            val ffiRemote =
                GixRemote(
                    name = "x",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo("x")
        }

        @Test
        fun `toModel handles very long remote name`() {
            val longName = "remote-" + "name-".repeat(50)
            val ffiRemote =
                GixRemote(
                    name = longName,
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo(longName)
        }

        @Test
        fun `toModel handles very long url`() {
            val longPath = "path/".repeat(100)
            val longUrl = "https://github.com/user/$longPath/repo.git"
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = longUrl,
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo(longUrl)
        }

        @Test
        fun `toModel handles url with special characters`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/user/repo-name_123.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://github.com/user/repo-name_123.git")
        }

        @Test
        fun `toModel handles url with subdomain`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://git.example.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://git.example.com/user/repo.git")
        }

        @Test
        fun `toModel handles url with deep path`() {
            val ffiRemote =
                GixRemote(
                    name = "origin",
                    url = "https://github.com/org/team/project/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.url).isEqualTo("https://github.com/org/team/project/repo.git")
        }

        @Test
        fun `toModel handles remote name with mixed alphanumeric`() {
            val ffiRemote =
                GixRemote(
                    name = "origin123",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo("origin123")
        }

        @Test
        fun `toModel handles remote name starting with number`() {
            val ffiRemote =
                GixRemote(
                    name = "123remote",
                    url = "https://github.com/user/repo.git",
                )

            val result = ffiRemote.toModel(repository.iid)

            assertThat(result.name).isEqualTo("123remote")
        }
    }

    // ========== Repository Scoping ==========

    @Test
    fun `toModel remotes are scoped to specific repository`() {
        val project2 = Project(name = "another-project")
        val repository2 = Repository(localPath = "/path/to/repo2", projectId = project2.iid).apply { this.project = project2 }

        val ffiRemote =
            GixRemote(
                name = "origin",
                url = "https://github.com/user/repo.git",
            )

        val remoteInRepo1 = ffiRemote.toModel(repository.iid)
        val remoteInRepo2 = ffiRemote.toModel(repository2.iid)

        // Different repository instances, so different remotes
        assertAll(
            { assertThat(remoteInRepo1).isNotSameAs(remoteInRepo2) },
            { assertThat(remoteInRepo1.name).isEqualTo("origin") },
            { assertThat(remoteInRepo2.name).isEqualTo("origin") },
            { assertThat(repository.remotes).containsOnly(remoteInRepo1) },
            { assertThat(repository2.remotes).containsOnly(remoteInRepo2) },
        )
    }

    // ========== Combination & Decision Coverage ==========

    @ParameterizedTest
    @CsvSource(
        // name, url, expectNew
        "'origin', 'https://github.com/user/repo.git', true",
        "'upstream', 'https://github.com/upstream/repo.git', true",
        "'fork', 'ssh://git@github.com/fork/repo.git', true",
        "'origin', 'https://github.com/user/different.git', false",
    )
    fun `toModel handles various remote scenarios`(
        name: String,
        url: String,
        expectNew: Boolean,
    ) {
        if (!expectNew) {
            // Create existing remote
            Remote(name = name, url = "https://github.com/user/original.git", repositoryId = repository.iid).apply {
                this.repository =
                    repository
            }
        }

        val ffiRemote = GixRemote(name = name, url = url)

        val result = ffiRemote.toModel(repository.iid)

        assertAll(
            { assertThat(result.name).isEqualTo(name) },
            { assertThat(result.url).isEqualTo(url) },
            { assertThat(result.repository).isSameAs(repository) },
        )
    }

    @Test
    fun `toModel decision path - new remote creation`() {
        val ffiRemote =
            GixRemote(
                name = "new-remote",
                url = "https://github.com/user/repo.git",
            )

        val result = ffiRemote.toModel(repository.iid)

        // Path: no existing remote → create new → register
        assertAll(
            { assertThat(repository.remotes).hasSize(1) },
            { assertThat(result.name).isEqualTo("new-remote") },
            { assertThat(result.url).isEqualTo("https://github.com/user/repo.git") },
        )
    }

    @Test
    fun `toModel decision path - existing remote same url`() {
        val existingRemote =
            Remote(
                name = "existing",
                url = "https://github.com/user/repo.git",
                repositoryId = repository.iid,
            ).apply { this.repository = repository }

        val ffiRemote =
            GixRemote(
                name = "existing",
                url = "https://github.com/user/repo.git",
            )

        val result = ffiRemote.toModel(repository.iid)

        // Path: existing remote found → url same → no update
        assertAll(
            { assertThat(result).isSameAs(existingRemote) },
            { assertThat(result.url).isEqualTo("https://github.com/user/repo.git") },
            { assertThat(repository.remotes).hasSize(1) },
        )
    }

    @Test
    fun `toModel decision path - existing remote different url`() {
        val existingRemote =
            Remote(
                name = "existing",
                url = "https://github.com/user/old.git",
                repositoryId = repository.iid,
            ).apply { this.repository = repository }

        val ffiRemote =
            GixRemote(
                name = "existing",
                url = "https://github.com/user/new.git",
            )

        val result = ffiRemote.toModel(repository.iid)

        // Path: existing remote found → url different → update url
        assertAll(
            { assertThat(result).isSameAs(existingRemote) },
            { assertThat(result.url).isEqualTo("https://github.com/user/new.git") },
            { assertThat(result.url).isNotEqualTo("https://github.com/user/old.git") },
            { assertThat(repository.remotes).hasSize(1) },
        )
    }

    @Test
    fun `toModel always returns non-null Remote`() {
        // Explicit null check to ensure contract is satisfied
        val ffiRemote =
            GixRemote(
                name = "origin",
                url = "https://github.com/user/repo.git",
            )

        val result = ffiRemote.toModel(repository.iid)

        assertThat(result).isNotNull
    }

    @Test
    fun `toModel multiple remotes do not interfere with each other`() {
        val ffiOrigin = GixRemote(name = "origin", url = "https://github.com/user/repo.git")
        val ffiUpstream = GixRemote(name = "upstream", url = "https://github.com/upstream/repo.git")
        val ffiFork = GixRemote(name = "fork", url = "https://github.com/fork/repo.git")

        val origin = ffiOrigin.toModel(repository.iid)
        val upstream = ffiUpstream.toModel(repository.iid)
        val fork = ffiFork.toModel(repository.iid)

        assertAll(
            { assertThat(repository.remotes).hasSize(3) },
            { assertThat(repository.remotes).containsExactlyInAnyOrder(origin, upstream, fork) },
            { assertThat(origin.name).isEqualTo("origin") },
            { assertThat(upstream.name).isEqualTo("upstream") },
            { assertThat(fork.name).isEqualTo("fork") },
        )
    }

    @Test
    fun `toModel idempotency - calling multiple times with same data returns same instance`() {
        val ffiRemote =
            GixRemote(
                name = "origin",
                url = "https://github.com/user/repo.git",
            )

        val result1 = ffiRemote.toModel(repository.iid)
        val result2 = ffiRemote.toModel(repository.iid)
        val result3 = ffiRemote.toModel(repository.iid)

        assertAll(
            { assertThat(result1).isSameAs(result2) },
            { assertThat(result2).isSameAs(result3) },
            { assertThat(repository.remotes).hasSize(1) },
        )
    }
}
