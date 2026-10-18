// package com.inso_world.binocular.infrastructure.sql.integration.persistence.repository
//
// import com.inso_world.binocular.infrastructure.sql.integration.persistence.repository.base.BaseRepositoryTest
// import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
// import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
// import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
// import com.inso_world.binocular.infrastructure.sql.persistence.entity.UserEntity
// import com.inso_world.binocular.infrastructure.sql.persistence.repository.ProjectRepository
// import com.inso_world.binocular.infrastructure.sql.persistence.repository.RepositoryRepository
// import com.inso_world.binocular.model.Commit
// import com.inso_world.binocular.model.Project
// import com.inso_world.binocular.model.Repository
// import com.inso_world.binocular.model.User
// import org.assertj.core.api.Assertions.assertThat
// import org.junit.jupiter.api.AfterEach
// import org.junit.jupiter.api.BeforeEach
// import org.junit.jupiter.api.DisplayName
// import org.junit.jupiter.api.Nested
// import org.junit.jupiter.api.Test
// import org.junit.jupiter.api.assertAll
// import org.springframework.beans.factory.annotation.Autowired
// import java.time.LocalDateTime
// import kotlin.uuid.ExperimentalUuidApi
// import kotlin.uuid.Uuid
//
// @OptIn(ExperimentalUuidApi::class)
// internal class RepositoryRepositoryTest : BaseRepositoryTest() {
//    @Autowired
//    private lateinit var repositoryRepository: RepositoryRepository
//
//    @Autowired
//    private lateinit var projectRepository: ProjectRepository
//
// //    @Autowired
// //    private lateinit var commitRepository: CommitRepository
//
//    private lateinit var testProject: ProjectEntity
//
//    @BeforeEach
//    fun setup() {
//        testProject = projectRepository.save(
//            ProjectEntity(
//                name = "Test Project",
//                iid = Project.Id(Uuid.random()),
//            ).apply { description = "Test Description" }
//        )
//    }
//
//    @AfterEach
//    fun cleanup() {
// //        tearDown()
//    }
//
//    private fun createRepositoryEntity(localPath: String): RepositoryEntity {
//        return RepositoryEntity(
//            iid = Repository.Id(Uuid.random()),
//            localPath = localPath,
//            project = testProject
//        )
//    }
//
//    private fun createCommitEntity(
//        sha: String,
//        repository: RepositoryEntity,
//        commitDateTime: LocalDateTime = LocalDateTime.of(2024, 1, 1, 12, 0)
//    ): CommitEntity {
//        val user = UserEntity(
//            name = "Test User",
//            email = "test@example.com",
//            repository = repository,
//            iid = User.Id(Uuid.random())
//        )
//        repository.user.add(user)
//
//        return CommitEntity(
//            sha = sha,
//            commitDateTime = commitDateTime,
//            repository = repository,
//            iid = Commit.Id(Uuid.random())
//        ).apply { committer = user }
//            .also {
//                repository.commits.add(it)
//            }
//    }
//
//    @Nested
//    @DisplayName("findByIidAndCommits_ShaIn Tests")
//    inner class FindByIidAndCommitsShaInTests {
//
//        @Test
//        fun `returns repository when iid exists and commits contain one of the SHAs`() {
//            val repository = createRepositoryEntity("/test/repo1")
//            val commit1 = createCommitEntity("a".repeat(40), repository)
//            val commit2 = createCommitEntity("b".repeat(40), repository)
//            val commit3 = createCommitEntity("c".repeat(40), repository)
//
//            val saved = repositoryRepository.save(repository)
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                listOf("a".repeat(40), "z".repeat(40))
//            )
//
//            assertAll(
//                "Verify repository found",
//                { assertThat(found).isNotNull },
//                { assertThat(found?.iid).isEqualTo(saved.iid) },
//                { assertThat(found?.localPath).isEqualTo("/test/repo1") },
//                { assertThat(found?.commits).hasSize(3) }
//            )
//        }
//
//        @Test
//        fun `returns repository when iid exists and commits contain all provided SHAs`() {
//            val repository = createRepositoryEntity("/test/repo2")
//            val commit1 = createCommitEntity("d".repeat(40), repository)
//            val commit2 = createCommitEntity("e".repeat(40), repository)
//
//            val saved = repositoryRepository.save(repository)
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                listOf("d".repeat(40), "e".repeat(40))
//            )
//
//            assertAll(
//                "Verify repository found with all matching SHAs",
//                { assertThat(found).isNotNull },
//                { assertThat(found?.iid).isEqualTo(saved.iid) },
//                { assertThat(found?.commits).hasSize(2) }
//            )
//        }
//
//        @Test
//        fun `returns null when iid exists but no commits match the SHAs`() {
//            val repository = createRepositoryEntity("/test/repo3")
// //            createCommitEntity("f".repeat(40), repository)
// //            createCommitEntity("1".repeat(40), repository)
//
//            val saved = repositoryRepository.save(repository)
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                listOf("x".repeat(40), "y".repeat(40))
//            )
//
//            assertThat(found).isNull()
//        }
//
//        @Test
//        fun `returns null when iid does not exist`() {
//            val repository = createRepositoryEntity("/test/repo4")
// //            createCommitEntity("2".repeat(40), repository)
// //
//            repositoryRepository.save(repository)
//
//            val nonExistentIid = kotlin.uuid.Uuid.random()
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                nonExistentIid,
//                listOf("2".repeat(40))
//            )
//
//            assertThat(found).isNull()
//        }
//
//        @Test
//        fun `returns null when repository has no commits`() {
//            val repository = createRepositoryEntity("/test/repo5")
//            val saved = repositoryRepository.save(repository)
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                listOf("3".repeat(40))
//            )
//
//            assertThat(found).isNull()
//        }
//
//        @Test
//        fun `returns repository when one of multiple SHAs matches`() {
//            val repository = createRepositoryEntity("/test/repo6")
// //            createCommitEntity("4".repeat(40), repository)
// //            createCommitEntity("5".repeat(40), repository)
// //
//            val saved = repositoryRepository.save(repository)
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                listOf("4".repeat(40), "nonexistent1", "nonexistent2")
//            )
//
//            assertAll(
//                "Verify repository found when at least one SHA matches",
//                { assertThat(found).isNotNull },
//                { assertThat(found?.iid).isEqualTo(saved.iid) }
//            )
//        }
//
//        @Test
//        fun `handles empty SHA collection by returning null`() {
//            val repository = createRepositoryEntity("/test/repo7")
//            createCommitEntity("6".repeat(40), repository)
//
//            val saved = repositoryRepository.save(repository)
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                emptyList()
//            )
//
//            assertThat(found).isNull()
//        }
//
//        @Test
//        fun `case sensitivity test - exact SHA match required`() {
//            val repository = createRepositoryEntity("/test/repo8")
//            createCommitEntity("abcdef1234567890abcdef1234567890abcdef12", repository)
//
//            val saved = repositoryRepository.save(repository)
//
//            val foundLowercase = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                listOf("abcdef1234567890abcdef1234567890abcdef12")
//            )
//
//            val foundUppercase = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                listOf("ABCDEF1234567890ABCDEF1234567890ABCDEF12")
//            )
//
//            assertAll(
//                "Verify SHA matching is case-sensitive",
//                { assertThat(foundLowercase).isNotNull },
//                { assertThat(foundUppercase).isNull() }
//            )
//        }
//
//        @Test
//        fun `works correctly with large number of SHAs`() {
//            val repository = createRepositoryEntity("/test/repo9")
//
//            // Create 50 commits
//            repeat(50) { index ->
//                createCommitEntity(index.toString().padStart(40, '0'), repository)
//            }
//
//            val saved = repositoryRepository.save(repository)
//
//            // Search with 100 SHAs (50 existing + 50 non-existing)
//            val shas = (0 until 100).map { it.toString().padStart(40, '0') }
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved.iid.value,
//                shas
//            )
//
//            assertAll(
//                "Verify repository found with large SHA collection",
//                { assertThat(found).isNotNull },
//                { assertThat(found?.commits).hasSize(50) }
//            )
//        }
//
//        @Test
//        fun `distinguishes between different repositories with same commit SHAs`() {
//            val repo1 = createRepositoryEntity("/test/repo10")
//            createCommitEntity("7".repeat(40), repo1)
//            val saved1 = repositoryRepository.save(repo1)
//
//            val repo2 = createRepositoryEntity("/test/repo11")
//            createCommitEntity("7".repeat(40), repo2)
//            val saved2 = repositoryRepository.save(repo2)
//
//            val foundRepo1 = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved1.iid.value,
//                listOf("7".repeat(40))
//            )
//
//            val foundRepo2 = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved2.iid.value,
//                listOf("7".repeat(40))
//            )
//
//            assertAll(
//                "Verify correct repositories are returned",
//                { assertThat(foundRepo1).isNotNull },
//                { assertThat(foundRepo2).isNotNull },
//                { assertThat(foundRepo1?.iid).isEqualTo(saved1.iid) },
//                { assertThat(foundRepo2?.iid).isEqualTo(saved2.iid) },
//                { assertThat(foundRepo1?.localPath).isEqualTo("/test/repo10") },
//                { assertThat(foundRepo2?.localPath).isEqualTo("/test/repo11") }
//            )
//        }
//
//        @Test
//        fun `returns null when searching wrong repository with correct SHA`() {
//            val repo1 = createRepositoryEntity("/test/repo12")
//            createCommitEntity("8".repeat(40), repo1)
//            repositoryRepository.save(repo1)
//
//            val repo2 = createRepositoryEntity("/test/repo13")
//            createCommitEntity("9".repeat(40), repo2)
//            val saved2 = repositoryRepository.save(repo2)
//
//            val found = repositoryRepository.findByIidAndCommits_ShaIn(
//                saved2.iid.value,
//                listOf("8".repeat(40)) // SHA from repo1
//            )
//
//            assertThat(found).isNull()
//        }
//    }
// }
