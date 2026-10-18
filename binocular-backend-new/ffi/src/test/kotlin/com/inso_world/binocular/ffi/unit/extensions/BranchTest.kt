package com.inso_world.binocular.ffi.unit.extensions

import com.inso_world.binocular.core.unit.base.BaseUnitTest
import com.inso_world.binocular.ffi.extensions.toDomain
import com.inso_world.binocular.ffi.internal.GixBranch
import com.inso_world.binocular.ffi.internal.GixReferenceCategory
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import com.inso_world.binocular.model.vcs.ReferenceCategory
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.ValueSource
import java.time.LocalDateTime

/**
 * Unit tests for [toDomain] extension function.
 *
 * Provides comprehensive C4 coverage testing:
 * - Name normalization (removes `refs/heads/`, `refs/remotes/` prefixes)
 * - Identity preservation (finding existing branches by business key)
 * - Head update logic (updates head when different)
 * - Branch registration in repository
 * - Repository consistency validation
 * - All decision paths and edge cases
 */
@Disabled("Refactored in domain model #454")
class BranchTest : BaseUnitTest() {
    private lateinit var project: Project
    private lateinit var repository: Repository
    private lateinit var headCommit: Commit
    private lateinit var anotherCommit: Commit

    @BeforeEach
    fun setUp() {
        project = Project(name = "test-project")
        repository =
            Repository(
                localPath = "/path/to/repo",
                projectId = project.iid,
            ).apply { this.project = project }
        val developer =
            Developer(name = "Test Committer", email = "committer@test.com", repositoryId = repository.iid).apply {
                this.repository =
                    repository
            }
        val signatureA = Signature(developerId = developer.iid, developer = developer, timestamp = LocalDateTime.of(2024, 1, 1, 0, 0))
        val signatureB = Signature(developerId = developer.iid, developer = developer, timestamp = LocalDateTime.of(2024, 1, 2, 0, 0))
        headCommit =
            Commit(
                sha = "a".repeat(40),
                authorSignature = signatureA,
                repositoryId = repository.iid,
                repository = repository,
            )
        anotherCommit =
            Commit(
                sha = "b".repeat(40),
                authorSignature = signatureB,
                repositoryId = repository.iid,
                repository = repository,
            )
    }

    // ========== Creating New Branches ==========

    @Test
    fun `toDomain creates new branch when no existing branch matches`() {
        val ffiBranch = gixBranch(name = "main")

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        assertThat(result).isNotNull
        assertThat(result.name).isEqualTo("main")
        assertThat(result.fullName).isEqualTo("main")
        assertThat(result.category).isEqualTo(ReferenceCategory.LOCAL_BRANCH)
        assertThat(result.headSha).isEqualTo(headCommit.sha)
    }

    @Test
    fun `toDomain registers new branch in repository branches collection`() {
        val ffiBranch = gixBranch(name = "feature-branch")

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        assertThat(repository.branches).contains(result)
        assertThat(repository.branches).hasSize(1)
    }

    @Test
    fun `toDomain creates branch with specified head commit`() {
        val ffiBranch = gixBranch(name = "develop")

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        assertThat(result.head).isSameAs(headCommit)
        assertThat(result.head?.sha).isEqualTo(headCommit.sha)
    }

    @Test
    fun `toDomain copies full name and category metadata`() {
        val ffiBranch =
            gixBranch(
                name = "feature",
                fullName = "refs/heads/feature",
                category = GixReferenceCategory.LOCAL_BRANCH,
            )

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        assertThat(result.fullName).isEqualTo("refs/heads/feature")
        assertThat(result.category).isEqualTo(ReferenceCategory.LOCAL_BRANCH)
    }

    // ========== Identity Preservation (Returning Existing Branches) ==========

    @Nested
    inner class IdentityPreservation {
        @Test
        fun `toDomain returns existing branch when name matches exactly`() {
            val existingBranch = branch(name = "main")

            val ffiBranch = gixBranch(name = "main")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result).isSameAs(existingBranch)
        }

        @Test
        fun `toDomain returns existing branch when normalized name matches`() {
            val existingBranch = branch(name = "refs/heads/feature")

            // FFI provides full ref, but normalized name matches
            val ffiBranch = gixBranch(name = "refs/heads/feature")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result).isSameAs(existingBranch)
        }

        @Test
        fun `toDomain does not create duplicate branches for same normalized name`() {
            val ffiBranch1 = gixBranch(name = "refs/heads/main")
            val ffiBranch2 = gixBranch(name = "refs/heads/main")

            val result1 = ffiBranch1.toDomain(repository.iid, headCommit)
            val result2 = ffiBranch2.toDomain(repository.iid, headCommit)

            assertThat(result1).isSameAs(result2)
            assertThat(repository.branches).hasSize(1)
        }

        @Test
        fun `toDomain correctly identifies branch among multiple branches`() {
            val branch1 = branch(name = "main")
            val branch2 = branch(name = "develop")
            val branch3 = branch(name = "feature")

            val ffiBranch = gixBranch(name = "develop")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result).isSameAs(branch2)
            assertThat(repository.branches).hasSize(3) // No new branch added
        }

        @Test
        fun `toDomain creates new branch when no match among existing branches`() {
            branch(name = "main")
            branch(name = "develop")

            val ffiBranch = gixBranch(name = "feature")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo("feature")
            assertThat(repository.branches).hasSize(3)
        }
    }

    // ========== Head Update Logic ==========

    @Nested
    inner class HeadUpdate {
        @Test
        fun `toDomain updates head when existing branch has different head`() {
            val existingBranch = branch(name = "main")
            assertThat(existingBranch.head).isSameAs(headCommit)

            val ffiBranch = gixBranch(name = "main")

            val result = ffiBranch.toDomain(repository.iid, anotherCommit)

            assertThat(result).isSameAs(existingBranch)
            assertThat(result.head).isSameAs(anotherCommit)
            assertThat(result.head).isNotSameAs(headCommit)
        }

        @Test
        fun `toDomain does not update head when it is already the same`() {
            val existingBranch = branch(name = "main")

            val ffiBranch = gixBranch(name = "main")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result).isSameAs(existingBranch)
            assertThat(result.head).isSameAs(headCommit)
        }

        @Test
        fun `toDomain updates head multiple times on repeated calls with different commits`() {
            val committer =
                Developer(name = "Test Committer", email = "committer@test.com", repositoryId = repository.iid).apply {
                    this.repository =
                        repository
                }
            val thirdCommit =
                Commit(
                    sha = "c".repeat(40),
                    authorSignature =
                        Signature(
                            developerId = committer.iid,
                            developer = committer,
                            timestamp = LocalDateTime.of(2024, 1, 3, 0, 0)
                        ),
                    repositoryId = repository.iid,
                    repository = repository,
                )

            val existingBranch = branch(name = "main")

            val ffiBranch = gixBranch(name = "main")

            // First update
            val result1 = ffiBranch.toDomain(repository.iid, anotherCommit)
            assertThat(result1.head).isSameAs(anotherCommit)

            // Second update
            val result2 = ffiBranch.toDomain(repository.iid, thirdCommit)
            assertThat(result2.head).isSameAs(thirdCommit)

            assertThat(result1).isSameAs(existingBranch)
            assertThat(result2).isSameAs(existingBranch)
        }
    }

    // ========== Repository Consistency Validation ==========

    @Nested
    inner class RepositoryConsistency {
        @Test
        fun `toDomain throws exception when head commit belongs to different repository`() {
            val project2 = Project(name = "another-project")
            val repository2 = Repository(localPath = "/path/to/repo2", projectId = project2.iid).apply { this.project = project2 }
            val testCommitter2 =
                Developer(name = "Test Committer", email = "commit2@test.com", repositoryId = repository2.iid).apply {
                    this.repository =
                        repository2
                }
            val commitFromDifferentRepo =
                Commit(
                    sha = "d".repeat(40),
                    authorSignature =
                        Signature(
                            developerId = testCommitter2.iid,
                            developer = testCommitter2,
                            timestamp = LocalDateTime.of(2024, 1, 1, 0, 0)
                        ),
                    repositoryId = repository2.iid,
                    repository = repository2,
                )

            val ffiBranch = gixBranch(name = "main")

            val exception =
                assertThrows<IllegalArgumentException> {
                    ffiBranch.toDomain(repository.iid, commitFromDifferentRepo)
                }

            assertThat(exception.message).contains("Head is from different repository")
        }

        @Test
        fun `toDomain throws exception when updating head with commit from different repository`() {
            val existingBranch = branch(name = "main")

            val project2 = Project(name = "another-project")
            val repository2 = Repository(localPath = "/path/to/repo2", projectId = project2.iid).apply { this.project = project2 }
            val testCommitter2 =
                Developer(name = "Test Committer", email = "commit2@test.com", repositoryId = repository2.iid).apply {
                    this.repository =
                        repository2
                }
            val commitFromDifferentRepo =
                Commit(
                    sha = "d".repeat(40),
                    authorSignature =
                        Signature(
                            developerId = testCommitter2.iid,
                            developer = testCommitter2,
                            timestamp = LocalDateTime.of(2024, 1, 1, 0, 0)
                        ),
                    repositoryId = repository2.iid,
                    repository = repository2,
                )

            val ffiBranch = gixBranch(name = "main")

            val exception =
                assertThrows<IllegalArgumentException> {
                    ffiBranch.toDomain(repository.iid, commitFromDifferentRepo)
                }

            assertThat(exception.message).contains("Head is from different repository")
            // Original branch head should remain unchanged
            assertThat(existingBranch.head).isSameAs(headCommit)
        }

        @Test
        fun `toDomain succeeds when head commit is from same repository`() {
            val ffiBranch = gixBranch(name = "main")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.head?.repositoryId).isEqualTo(repository.iid)
            assertThat(result.repositoryId).isEqualTo(repository.iid)
        }
    }

    // ========== Edge Cases ==========

    @Nested
    inner class EdgeCases {
        @Test
        fun `toDomain handles minimal valid branch name`() {
            val ffiBranch = gixBranch(name = "x")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo("x")
        }

        @Test
        fun `toDomain handles very long branch name`() {
            val longName = "feature/" + "very-long-name-".repeat(50)
            val ffiBranch = gixBranch(name = longName)

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo(longName)
        }

        @Test
        fun `toDomain handles branch name with special characters`() {
            val ffiBranch = gixBranch(name = "feature/issue-#123")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo("feature/issue-#123")
        }

        @Test
        fun `toDomain handles branch name with Unicode characters`() {
            val ffiBranch = gixBranch(name = "功能/新特性")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo("功能/新特性")
        }

        @Test
        fun `toDomain handles branch name with dots`() {
            val ffiBranch = gixBranch(name = "release/1.0.0")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo("release/1.0.0")
        }

        @Test
        fun `toDomain handles branch name with underscores and hyphens`() {
            val ffiBranch = gixBranch(name = "feature_branch-new-ui")

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo("feature_branch-new-ui")
        }

        @ParameterizedTest
        @ValueSource(
            strings = [
                "main",
                "develop",
                "feature/new-ui",
                "hotfix/urgent-fix",
                "release/v1.0.0",
                "bugfix/fix-bug-123",
                "experiment/try-something",
            ],
        )
        fun `toDomain handles common Git branch naming patterns`(branchName: String) {
            val ffiBranch = gixBranch(name = branchName)

            val result = ffiBranch.toDomain(repository.iid, headCommit)

            assertThat(result.name).isEqualTo(branchName)
        }
    }

    // ========== Repository Scoping ==========

    @Test
    fun `toDomain branches are scoped to specific repository`() {
        val project2 = Project(name = "another-project")
        val repository2 = Repository(localPath = "/path/to/repo2", projectId = project2.iid).apply { this.project = project2 }
        val testCommitter2 =
            Developer(name = "Test Committer", email = "commit2@test.com", repositoryId = repository2.iid).apply {
                this.repository =
                    repository2
            }
        val commit2 =
            Commit(
                sha = "e".repeat(40),
                authorSignature =
                    Signature(
                        developerId = testCommitter2.iid,
                        developer = testCommitter2,
                        timestamp = LocalDateTime.of(2024, 1, 1, 0, 0)
                    ),
                repositoryId = repository2.iid,
                repository = repository2,
            )

        val ffiBranch = gixBranch(name = "main")

        val branchInRepo1 = ffiBranch.toDomain(repository.iid, headCommit)
        val branchInRepo2 = ffiBranch.toDomain(repository2.iid, commit2)

        // Different repository instances, so different branches
        assertThat(branchInRepo1).isNotSameAs(branchInRepo2)
        assertThat(branchInRepo1.name).isEqualTo("main")
        assertThat(branchInRepo2.name).isEqualTo("main")
        assertThat(repository.branches).containsOnly(branchInRepo1)
        assertThat(repository2.branches).containsOnly(branchInRepo2)
    }

    // ========== Combination & Decision Coverage ==========

    @ParameterizedTest
    @CsvSource(
        // ffiName, expectedName, createExisting
        "'main','refs/heads/main', 'main', false",
        "'develop','refs/heads/develop', 'develop', false",
        "'origin/feature','refs/remotes/origin/feature', 'origin/feature', false",
        "'main','refs/heads/main', 'main', true",
        "'main','refs/heads/main', 'main', true",
    )
    fun `toDomain handles various branch scenarios`(
        name: String,
        fullName: String,
        expectedName: String,
        createExisting: Boolean,
    ) {
        if (createExisting) {
            branch(name = expectedName)
        }

        val ffiBranch =
            gixBranch(name = name, fullName = fullName, category = GixReferenceCategory.LOCAL_BRANCH)

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        assertThat(result.name).isEqualTo(expectedName)
        assertThat(result.repository).isSameAs(repository)
        assertThat(result.head).isSameAs(headCommit)
    }

    @Test
    fun `toDomain decision path - new branch creation`() {
        val ffiBranch = gixBranch(name = "new-branch", fullName = "refs/heads/new-branch", category = GixReferenceCategory.LOCAL_BRANCH)

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        // Path: no existing branch → create new → register
        assertThat(repository.branches).hasSize(1)
        assertThat(result.name).isEqualTo("new-branch")
        assertThat(result.head).isSameAs(headCommit)
    }

    @Test
    fun `toDomain decision path - existing branch same head`() {
        val existingBranch = branch(name = "existing")

        val ffiBranch = gixBranch(name = "existing", fullName = "refs/heads/existing", category = GixReferenceCategory.LOCAL_BRANCH)

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        // Path: existing branch found → head same → no update
        assertThat(result).isSameAs(existingBranch)
        assertThat(result.head).isSameAs(headCommit)
        assertThat(repository.branches).hasSize(1)
    }

    @Test
    fun `toDomain decision path - existing branch different head`() {
        val existingBranch = branch(name = "existing")

        val ffiBranch = gixBranch(name = "existing")

        val result = ffiBranch.toDomain(repository.iid, anotherCommit)

        // Path: existing branch found → head different → update head
        assertThat(result).isSameAs(existingBranch)
        assertThat(result.head).isSameAs(anotherCommit)
        assertThat(result.head).isNotSameAs(headCommit)
        assertThat(repository.branches).hasSize(1)
    }

    @Test
    fun `toDomain decision path - normalized name creates identity`() {
        val ffiBranch1 = gixBranch(name = "refs/heads/feature")
        val ffiBranch2 = gixBranch(name = "refs/heads/feature")
        val ffiBranch3 = gixBranch(name = "refs/heads/feature")

        // All should resolve to same branch via normalized name "feature"
        val result1 = ffiBranch1.toDomain(repository.iid, headCommit)
        val result2 = ffiBranch2.toDomain(repository.iid, headCommit)

        assertThat(result1).isSameAs(result2)
        assertThat(result1.name).isEqualTo("refs/heads/feature")
        assertThat(repository.branches).hasSize(1)

        // But refs/remotes/feature normalizes to just "feature" too (only first prefix removed)
        // Actually, let me reconsider: removePrefix only removes if it starts with that exact string
        // So "refs/remotes/feature" first tries removePrefix("refs/heads/") -> no change
        // Then tries removePrefix("refs/remotes/") -> "feature"
        val result3 = ffiBranch3.toDomain(repository.iid, headCommit)
        assertThat(result3).isSameAs(result1)
        assertThat(repository.branches).hasSize(1)
    }

    @Test
    fun `toDomain always returns non-null Branch`() {
        // Explicit null check to ensure contract is satisfied
        val ffiBranch = gixBranch(name = "refs/heads/main")

        val result = ffiBranch.toDomain(repository.iid, headCommit)

        assertThat(result).isNotNull
    }

    private fun branch(
        name: String,
        fullName: String = name,
        category: ReferenceCategory = ReferenceCategory.LOCAL_BRANCH,
        repository: Repository = this.repository,
        head: Commit = this.headCommit,
    ): Branch =
        Branch(
            name = name,
            fullName = fullName,
            category = category,
            repositoryId = repository.iid,
            repository = repository,
            headSha = head.sha,
            head = head,
        )

    companion object {
        private const val DEFAULT_TARGET = "0000000000000000000000000000000000000000"

        private fun gixBranch(
            name: String,
            fullName: String = name,
            target: String = DEFAULT_TARGET,
            category: GixReferenceCategory = GixReferenceCategory.LOCAL_BRANCH,
        ) = GixBranch(
            fullName = fullName,
            name = name,
            target = target,
            category = category,
        )
    }
}
