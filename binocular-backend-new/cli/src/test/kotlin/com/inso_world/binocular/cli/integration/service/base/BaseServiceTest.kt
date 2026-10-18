package com.inso_world.binocular.cli.integration.service.base

import com.inso_world.binocular.cli.BinocularCommandLineApplication
import com.inso_world.binocular.cli.integration.utils.RealDataProvider
import com.inso_world.binocular.cli.service.RepositoryService
import com.inso_world.binocular.core.index.GitIndexer
import com.inso_world.binocular.core.integration.base.BaseFixturesIntegrationTest
import com.inso_world.binocular.core.integration.base.InfrastructureDataSetup
import com.inso_world.binocular.core.service.CommitInfrastructurePort
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

@SpringBootTest(
    classes = [BinocularCommandLineApplication::class],
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
)
@ContextConfiguration(
    initializers = [
        SqlTestConfig.Initializer::class,
    ]
)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
internal class BaseServiceTest : BaseFixturesIntegrationTest() {
    @Autowired
    private lateinit var idx: GitIndexer

    @Autowired
    private lateinit var testDataSetupService: InfrastructureDataSetup

    @Autowired
    internal lateinit var commitPort: CommitInfrastructurePort

    @Autowired
    @Lazy
    private lateinit var repoService: RepositoryService

    //
//    @Autowired
//    internal lateinit var userRepository: UserInfrastructurePort
//
    @Autowired
    internal lateinit var repositoryPort: RepositoryInfrastructurePort

    //
//    @Autowired
//    internal lateinit var branchRepository: BranchRepository
//
    @Autowired
    private lateinit var projectPort: ProjectInfrastructurePort

    protected lateinit var simpleRepo: Repository

    protected lateinit var simpleProject: Project
    protected lateinit var advancedProject: Project
    protected lateinit var octoProject: Project

    @BeforeEach
    fun setupBase() {
        val simpleProject =
            run {
                val data = RealDataProvider(idx)
                data.setUp(
                    projectName = SIMPLE_PROJECT_NAME,
                    repoPath = "${FIXTURES_PATH}/${SIMPLE_REPO}",
                    branchName = "master",
                )
                data.project
            }
        this.simpleProject = projectPort.create(simpleProject)
        this.simpleRepo =
            requireNotNull(this.simpleProject.repo) {
                "Repository could not be created with Project"
            }
        this.simpleProject.repo = this.simpleRepo
    }

    @AfterEach
    fun cleanup() {
        testDataSetupService.teardown()
    }
}
