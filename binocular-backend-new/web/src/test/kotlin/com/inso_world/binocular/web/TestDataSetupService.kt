package com.inso_world.binocular.web

import com.inso_world.binocular.core.integration.base.InfrastructureDataSetup
import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.core.service.BranchInfrastructurePort
import com.inso_world.binocular.core.service.BuildInfrastructurePort
import com.inso_world.binocular.core.service.CommitInfrastructurePort
import com.inso_world.binocular.core.service.FileInfrastructurePort
import com.inso_world.binocular.core.service.IssueInfrastructurePort
import com.inso_world.binocular.core.service.MergeRequestInfrastructurePort
import com.inso_world.binocular.core.service.MilestoneInfrastructurePort
import com.inso_world.binocular.core.service.ModuleInfrastructurePort
import com.inso_world.binocular.core.service.NoteInfrastructurePort
import com.inso_world.binocular.core.service.UserInfrastructurePort
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

/**
 * Service for setting up test data in the database.
 * This service uses only infrastructure ports to create test data,
 * making it completely independent of specific infrastructure implementations.
 *
 * Note: This service only sets up entity data. Relationships between entities
 * are handled by the infrastructure implementation itself based on the entity data
 * and any relationship methods exposed by the infrastructure ports.
 */
// Disable or whatever here
@Service
internal class TestDataSetupService(
    @Autowired private val infrastructureDataSetup: InfrastructureDataSetup,
//    private val testDataProvider: TestDataProvider,
    private val commitRepository: CommitInfrastructurePort,
    private val accountRepository: AccountInfrastructurePort,
    private val branchRepository: BranchInfrastructurePort,
    private val buildRepository: BuildInfrastructurePort,
    private val fileRepository: FileInfrastructurePort,
    private val issueRepository: IssueInfrastructurePort,
    private val mergeRequestRepository: MergeRequestInfrastructurePort,
    private val moduleRepository: ModuleInfrastructurePort,
    private val noteRepository: NoteInfrastructurePort,
    @Autowired(required = false) private val userRepository: UserInfrastructurePort? = null,
    private val milestoneRepository: MilestoneInfrastructurePort,
) {
    /**
     * Clears all test data from the database.
     * This method only clears entity data, as relationship data is managed
     * by the infrastructure implementation.
     */
    fun clearAllData() {
        infrastructureDataSetup.teardown()
    }

    /**
     * Sets up test data in the database.
     * This method creates all test entities. Relationships between entities
     * are handled by the infrastructure implementation based on the entity data.
     */
    fun setupTestData() {
        infrastructureDataSetup.setup()
    }
}
