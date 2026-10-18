package com.inso_world.binocular.cli.integration.persistence.dao.sql.base

import com.inso_world.binocular.cli.BinocularCommandLineApplication
import com.inso_world.binocular.cli.integration.utils.RepositoryConfig
import com.inso_world.binocular.cli.integration.utils.setupRepoConfig
import com.inso_world.binocular.core.index.GitIndexer
import com.inso_world.binocular.core.integration.base.BaseFixturesIntegrationTest
import com.inso_world.binocular.core.integration.base.InfrastructureDataSetup
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.SqlTestConfig
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Lazy
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ContextConfiguration

@SpringBootTest(classes = [BinocularCommandLineApplication::class])
@DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
@ContextConfiguration(
    initializers = [
        SqlTestConfig.Initializer::class,
    ]
)
class BasePersistenceWithDataTest : BaseFixturesIntegrationTest() {
    @Autowired @Lazy
    private lateinit var indexer: GitIndexer

    @Autowired
    private lateinit var testDataSetupService: InfrastructureDataSetup

    @Autowired
    internal lateinit var repositoryPort: RepositoryInfrastructurePort

    @Autowired
    private lateinit var projectPort: ProjectInfrastructurePort

    protected lateinit var simpleRepo: Repository
    protected lateinit var octoRepo: Repository

    @BeforeEach
    fun setupBase() {
        fun prepare(repoConfig: RepositoryConfig): Project {
            repoConfig.project.repo = repoConfig.repo

            val project = projectPort.create(repoConfig.project)

            return project
        }

        prepare(
            setupRepoConfig(
                indexer,
                "${FIXTURES_PATH}/${SIMPLE_REPO}",
                "HEAD",
                projectName = SIMPLE_PROJECT_NAME,
//                branch = Branch(name = "master", fullName = "refs/remotes/origin/master", category = ReferenceCategory.REMOTE_BRANCH),
                branchName = "master"
            ),
        ).also { savedProject ->
            savedProject.repo?.let { this.simpleRepo = it }
                ?: throw IllegalStateException("Repository must not be null after save")
        }

        prepare(
            setupRepoConfig(
                indexer,
                "${FIXTURES_PATH}/${OCTO_REPO}",
                "HEAD",
                projectName = OCTO_PROJECT_NAME,
                branchName = "master"
            ),
        ).also { savedProject ->
            savedProject.repo?.let { this.octoRepo = it }
                ?: throw IllegalStateException("Repository must not be null after save")
        }
    }

    @AfterEach
    fun cleanup() {
        testDataSetupService.teardown()
    }
}
