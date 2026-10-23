package com.inso_world.binocular.model

import com.inso_world.binocular.domain.data.MockTestDataProvider
import com.inso_world.binocular.model.vcs.ReferenceCategory
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.time.LocalDateTime

class BranchModelTest {
    private lateinit var repository: Repository
    private lateinit var head: Commit

    @BeforeEach
    fun setup() {
        val project = Project(name = "test project")
        repository = Repository(localPath = "test repo", projectId = project.iid)
        val developer = Developer(name = "Test Developer", email = "dev@test.com", repositoryId = repository.iid)
        val signature = Signature(developerId = developer.iid, timestamp = LocalDateTime.now().minusSeconds(1))
        head = Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )
    }

    @ParameterizedTest
    @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideAllowedStrings")
    fun `create branch with allowed names, should succeed`(name: String) {
        assertDoesNotThrow {
            branch(
                name = name,
                fullName = name,
            )
        }
    }

    @ParameterizedTest
    @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideBlankStrings")
    fun `create branch with blank name, should fail`(name: String) {
        assertThrows<IllegalArgumentException> {
            branch(
                name = name,
                fullName = name,
            )
        }
    }

    @Test
    fun `create branch, check iid is set automatically`() {
        val branch = branch()

        assertThat(branch.iid).isNotNull()
    }

    @Test
    fun `create branch, stores provided metadata`() {
        val branch =
            branch(
                name = "main",
                fullName = "refs/heads/main",
                category = ReferenceCategory.LOCAL_BRANCH,
            )

        assertThat(branch.fullName).isEqualTo("refs/heads/main")
        assertThat(branch.category).isEqualTo(ReferenceCategory.LOCAL_BRANCH)
    }

    @ParameterizedTest
    @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideBlankStrings")
    fun `create branch with blank fullName should fail`(fullName: String) {
        assertThrows<IllegalArgumentException> {
            branch(name = "branch", fullName = fullName)
        }
    }

    @Test
    fun `create branch, validate uniqueKey`() {
        val branch = branch()

        assertAll(
            { assertThat(branch.uniqueKey).isEqualTo(Branch.Key(repository.iid, "branch")) },
            { assertThat(branch.uniqueKey.repositoryId).isEqualTo(repository.iid) },
            { assertThat(branch.uniqueKey.repositoryId.value).isEqualTo(repository.iid.value) },
            { assertThat(branch.uniqueKey.name).isEqualTo(branch.name) },
        )
    }

    @Test
    fun `create branch, check that hashCode is based on iid`() {
        val branch = branch()

        assertThat(branch.hashCode()).isEqualTo(branch.iid.hashCode())
    }

    @Test
    fun `create branch, assert that id is null`() {
        val branch = branch()

        assertThat(branch.id).isNull()
    }

    @Nested
    inner class CommitRelation {
        @BeforeEach
        fun setup() {
            this@BranchModelTest.setup()
        }

        @Test
        fun `create branch, with commit, get headSha, should succeed`() {
            val branch =
                branch(
                    head = head,
                )

            assertThat(branch.headSha).isEqualTo(head.sha)
        }

        @Test
        fun `create branch, check repositoryId matches`() {
            val branch = branch()
            assertThat(branch.repositoryId).isEqualTo(repository.iid)
        }
    }

    private fun branch(
        name: String = "branch",
        fullName: String = name,
        category: ReferenceCategory = ReferenceCategory.LOCAL_BRANCH,
        repository: Repository = this.repository,
        head: Commit = this.head,
    ): Branch =
        Branch(
            name = name,
            fullName = fullName,
            category = category,
            repositoryId = repository.iid,
            headSha = head.sha,
        )
}
