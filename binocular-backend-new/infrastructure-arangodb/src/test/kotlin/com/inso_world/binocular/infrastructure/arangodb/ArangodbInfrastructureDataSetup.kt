package com.inso_world.binocular.infrastructure.arangodb

import com.inso_world.binocular.core.data.MockTestDataProvider
import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.integration.base.InfrastructureDataSetup
import com.inso_world.binocular.core.integration.base.TestDataProvider
import com.inso_world.binocular.infrastructure.arangodb.model.edge.BranchFileConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitBuildConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitCommitConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitFileConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitFileUserConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitModuleConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.CommitUserConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.IssueAccountConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.IssueCommitConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.IssueMilestoneConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.IssueNoteConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.IssueUserConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.MergeRequestAccountConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.MergeRequestMilestoneConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.MergeRequestNoteConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.ModuleFileConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.ModuleModuleConnection
import com.inso_world.binocular.infrastructure.arangodb.model.edge.NoteAccountConnection
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IBranchFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IBranchFileFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.ICommitBuildConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.ICommitCommitConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitFileUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitModuleConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueCommitConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueMilestoneConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueNoteConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestMilestoneConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestNoteConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IModuleFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IModuleModuleConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.INoteAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IDeveloperDao
import com.inso_world.binocular.infrastructure.arangodb.service.AccountInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.BranchInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.BuildInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.CommitInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.FileInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.IssueInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.MergeRequestInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.MilestoneInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.ModuleInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.NoteInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.ProjectInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.RepositoryInfrastructurePortImpl
import com.inso_world.binocular.infrastructure.arangodb.service.UserInfrastructurePortImpl
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
internal class ArangodbInfrastructureDataSetup(
//    @Autowired private val infrastructureDataSetup: InfrastructureDataSetup,
    @Autowired private val commitRepository: CommitInfrastructurePortImpl,
    @Autowired private val accountRepository: AccountInfrastructurePortImpl,
    @Autowired private val branchRepository: BranchInfrastructurePortImpl,
    @Autowired private val buildRepository: BuildInfrastructurePortImpl,
    @Autowired private val fileRepository: FileInfrastructurePortImpl,
    @Autowired private val issueRepository: IssueInfrastructurePortImpl,
    @Autowired private val mergeRequestRepository: MergeRequestInfrastructurePortImpl,
    @Autowired private val moduleRepository: ModuleInfrastructurePortImpl,
    @Autowired private val noteRepository: NoteInfrastructurePortImpl,
    @Autowired private val userRepository: UserInfrastructurePortImpl,
    @Autowired private val milestoneRepository: MilestoneInfrastructurePortImpl,
    @Autowired private val projectRepository: ProjectInfrastructurePortImpl,
    @Autowired private val repositoryRepository: RepositoryInfrastructurePortImpl,
    @Autowired private val developerDao: IDeveloperDao,
) : InfrastructureDataSetup {
    companion object {
        private val logger by logger()
    }

    @Autowired
    private lateinit var branchFileConnectionRepository: IBranchFileConnectionDao

    @Autowired
    private lateinit var branchFileFileConnectionRepository: IBranchFileFileConnectionDao

    @Autowired
    private lateinit var commitBuildConnectionRepository: ICommitBuildConnectionDao

    @Autowired
    private lateinit var commitCommitConnectionRepository: ICommitCommitConnectionDao

    @Autowired
    private lateinit var commitFileConnectionRepository: ICommitFileConnectionDao

    @Autowired
    private lateinit var commitFileUserConnectionRepository: ICommitFileUserConnectionDao

    @Autowired
    private lateinit var commitModuleConnectionRepository: ICommitModuleConnectionDao

    @Autowired
    private lateinit var commitUserConnectionRepository: ICommitUserConnectionDao

    @Autowired
    private lateinit var issueAccountConnectionRepository: IIssueAccountConnectionDao

    @Autowired
    private lateinit var issueCommitConnectionRepository: IIssueCommitConnectionDao

    @Autowired
    private lateinit var issueMilestoneConnectionRepository: IIssueMilestoneConnectionDao

    @Autowired
    private lateinit var issueNoteConnectionRepository: IIssueNoteConnectionDao

    @Autowired
    private lateinit var issueUserConnectionRepository: IIssueUserConnectionDao

    @Autowired
    private lateinit var mergeRequestAccountConnectionRepository: IMergeRequestAccountConnectionDao

    @Autowired
    private lateinit var mergeRequestMilestoneConnectionRepository: IMergeRequestMilestoneConnectionDao

    @Autowired
    private lateinit var mergeRequestNoteConnectionRepository: IMergeRequestNoteConnectionDao

    @Autowired
    private lateinit var moduleFileConnectionRepository: IModuleFileConnectionDao

    @Autowired
    private lateinit var moduleModuleConnectionRepository: IModuleModuleConnectionDao

    @Autowired
    private lateinit var noteAccountConnectionRepository: INoteAccountConnectionDao

    private lateinit var mockTestData: MockTestDataProvider

    override fun setup() {
        logger.info(">>> ArangodbInfrastructureDataSetup setup")
        this.mockTestData = MockTestDataProvider()
        // order: create parents first where necessary
        projectRepository.saveAll(listOf(TestDataProvider.project) + mockTestData.testProjects)
        val project = mockTestData.projectsByName.getValue("proj-for-repos")
        repositoryRepository.saveAll(listOf(TestDataProvider.repository) + mockTestData.testRepositories)
        developerDao.saveAll(TestDataProvider.testDevelopers)

        commitRepository.saveAll(TestDataProvider.testCommits)
        accountRepository.saveAll(TestDataProvider.testAccounts)
        branchRepository.saveAll(TestDataProvider.testBranches)
        buildRepository.saveAll(TestDataProvider.testBuilds)
        fileRepository.saveAll(TestDataProvider.testFiles)
        issueRepository.saveAll(TestDataProvider.testIssues)
        mergeRequestRepository.saveAll(TestDataProvider.testMergeRequests)
        milestoneRepository.saveAll(TestDataProvider.testMilestones)
        moduleRepository.saveAll(TestDataProvider.testModules)
        noteRepository.saveAll(TestDataProvider.testNotes)
        userRepository.saveAll(TestDataProvider.testUsers)

        createEntityRelationships()
        logger.info("<<< ArangodbInfrastructureDataSetup setup")
    }

    override fun teardown() {
        logger.info(">>> ArangodbInfrastructureDataSetup teardown")
        // First clear all edge connections
        branchFileConnectionRepository.deleteAll()
        branchFileFileConnectionRepository.deleteAll()
        commitBuildConnectionRepository.deleteAll()
        commitCommitConnectionRepository.deleteAll()
        commitFileConnectionRepository.deleteAll()
        commitFileUserConnectionRepository.deleteAll()
        commitModuleConnectionRepository.deleteAll()
        commitUserConnectionRepository.deleteAll()
        issueAccountConnectionRepository.deleteAll()
        issueCommitConnectionRepository.deleteAll()
        issueMilestoneConnectionRepository.deleteAll()
        issueNoteConnectionRepository.deleteAll()
        issueUserConnectionRepository.deleteAll()
        mergeRequestAccountConnectionRepository.deleteAll()
        mergeRequestMilestoneConnectionRepository.deleteAll()
        mergeRequestNoteConnectionRepository.deleteAll()
        moduleFileConnectionRepository.deleteAll()
        moduleModuleConnectionRepository.deleteAll()
        noteAccountConnectionRepository.deleteAll()

        // entities
        developerDao.deleteAll()
        commitRepository.deleteAllEntities()
        accountRepository.deleteAllEntities()
        branchRepository.deleteAllEntities()
        buildRepository.deleteAllEntities()
        fileRepository.deleteAllEntities()
        issueRepository.deleteAllEntities()
        mergeRequestRepository.deleteAllEntities()
        milestoneRepository.deleteAllEntities()
        moduleRepository.deleteAllEntities()
        noteRepository.deleteAllEntities()
        userRepository.deleteAllEntities()
        repositoryRepository.deleteAllEntities()
        projectRepository.deleteAllEntities()
        logger.info("<<< ArangodbInfrastructureDataSetup teardown")
    }

    private fun createEntityRelationships() {
        // Branch relationships
        connectBranchesToFiles()

        // Commit relationships
        connectCommitsToBuilds()
        connectCommitsToCommits()
        connectCommitsToFiles()
        connectCommitsToModules()
        connectCommitsToUsers()

        // Issue relationships
        connectIssuesToAccounts()
        connectIssuesToCommits()
        connectIssuesToMilestones()
        connectIssuesToNotes()
        connectIssuesToUsers()

        // MergeRequest relationships
        connectMergeRequestsToAccounts()
        connectMergeRequestsToMilestones()
        connectMergeRequestsToNotes()

        // Module relationships
        connectModulesToFiles()
        connectModulesToModules()

        // Note relationships
        connectNotesToAccounts()

        // User relationships
        connectCommitFilesToUsers()
    }

    private fun connectBranchesToFiles() {
        val branch1 = TestDataProvider.testBranches[0]
        val branch2 = TestDataProvider.testBranches[1]

        val branch1Id = branch1.id ?: throw IllegalStateException("Branch ID cannot be null")
        val branch2Id = branch2.id ?: throw IllegalStateException("Branch ID cannot be null")

        // Branch 1 -> File 1 and File 2
        TestDataProvider.testFiles.forEach { file ->
            val fileId = file.id ?: throw IllegalStateException("File ID cannot be null")
            val connection =
                BranchFileConnection(
                    id = "branch_${branch1Id}_file_$fileId", // <-- Set id here (equals to _key)
                    from = branch1,
                    to = file,
                )
            branchFileConnectionRepository.save(connection)
        }

        // Branch 2 -> File 2 only
        val file2Id = TestDataProvider.testFiles[1].id ?: throw IllegalStateException("File ID cannot be null")
        val connection =
            BranchFileConnection(
                id = "branch_${branch2Id}_file_$file2Id", // <-- Set id here too
                from = branch2,
                to = TestDataProvider.testFiles[1],
            )
        branchFileConnectionRepository.save(connection)
    }

    private fun connectCommitsToBuilds() {
        val commit1 = TestDataProvider.testCommits[0]
        val build1 = TestDataProvider.testBuilds[0]

        val commit1Id = commit1.id ?: throw IllegalStateException("Commit ID cannot be null")
        val build1Id = build1.id ?: throw IllegalStateException("Build ID cannot be null")

        // Commit 1 -> Build 1
        val connection =
            CommitBuildConnection(
                id = "commit_${commit1Id}_build_$build1Id",
                from = commit1,
                to = build1,
            )
        commitBuildConnectionRepository.save(connection)
    }

    private fun connectCommitsToCommits() {
        val commit1 = TestDataProvider.testCommits[0]
        val commit2 = TestDataProvider.testCommits[1]

        val commit1Id = commit1.id ?: throw IllegalStateException("Commit ID cannot be null")
        val commit2Id = commit2.id ?: throw IllegalStateException("Commit ID cannot be null")

        // Commit 2 -> Commit 1 (Commit 1 is parent of Commit 2)
        val connection =
            CommitCommitConnection(
                id = "commit_${commit2Id}_commit_$commit1Id",
                from = commit2,
                to = commit1,
            )
        commitCommitConnectionRepository.save(connection)
    }

    private fun connectCommitsToFiles() {
        val commit1 = TestDataProvider.testCommits[0]
        val file1 = TestDataProvider.testFiles[0]

        val commit1Id = commit1.id ?: throw IllegalStateException("Commit ID cannot be null")
        val file1Id = file1.id ?: throw IllegalStateException("File ID cannot be null")

        // Commit 1 -> File 1
        val connection =
            CommitFileConnection(
                id = "commit_${commit1Id}_file_$file1Id",
                from = commit1,
                to = file1,
                lineCount = 100,
            )
        commitFileConnectionRepository.save(connection)
    }

    private fun connectCommitsToModules() {
        val commit1 = TestDataProvider.testCommits[0]
        val module1 = TestDataProvider.testModules[0]

        val commit1Id = commit1.id ?: throw IllegalStateException("Commit ID cannot be null")
        val module1Id = module1.id ?: throw IllegalStateException("Module ID cannot be null")

        // Commit 1 -> Module 1
        val connection =
            CommitModuleConnection(
                id = "commit_${commit1Id}_module_$module1Id",
                from = commit1,
                to = module1,
            )
        commitModuleConnectionRepository.save(connection)
    }

    private fun connectCommitsToUsers() {
        val commit1 = TestDataProvider.testCommits[0]
        val user1 = TestDataProvider.testUsers[0]

        val commit1Id = commit1.id ?: throw IllegalStateException("Commit ID cannot be null")
        val user1Id = user1.id ?: throw IllegalStateException("User ID cannot be null")

        // Commit 1 -> User 1
        val connection =
            CommitUserConnection(
                id = "commit_${commit1Id}_user_$user1Id",
                from = commit1,
                to = user1,
            )
        commitUserConnectionRepository.save(connection)
    }

    private fun connectIssuesToAccounts() {
        val issue1 = TestDataProvider.testIssues[0]
        val account1 = TestDataProvider.testAccounts[0]

        val issue1Id = issue1.id ?: throw IllegalStateException("Issue ID cannot be null")
        val account1Id = account1.id ?: throw IllegalStateException("Account ID cannot be null")

        // Issue 1 -> Account 1
        val connection =
            IssueAccountConnection(
                id = "issue_${issue1Id}_account_$account1Id",
                from = issue1,
                to = account1,
            )
        issueAccountConnectionRepository.save(connection)
    }

    private fun connectIssuesToCommits() {
        val issue1 = TestDataProvider.testIssues[0]
        val commit1 = TestDataProvider.testCommits[0]

        val issue1Id = issue1.id ?: throw IllegalStateException("Issue ID cannot be null")
        val commit1Id = commit1.id ?: throw IllegalStateException("Commit ID cannot be null")

        // Issue 1 -> Commit 1
        val connection =
            IssueCommitConnection(
                id = "issue_${issue1Id}_commit_$commit1Id",
                from = issue1,
                to = commit1,
            )
        issueCommitConnectionRepository.save(connection)
    }

    private fun connectIssuesToMilestones() {
        val issue1 = TestDataProvider.testIssues[0]
        val milestone1 = TestDataProvider.testMilestones[0]

        val issue1Id = issue1.id ?: throw IllegalStateException("Issue ID cannot be null")
        val milestone1Id = milestone1.id ?: throw IllegalStateException("Milestone ID cannot be null")

        // Issue 1 -> Milestone 1
        val connection =
            IssueMilestoneConnection(
                id = "issue_${issue1Id}_milestone_$milestone1Id",
                from = issue1,
                to = milestone1,
            )
        issueMilestoneConnectionRepository.save(connection)
    }

    private fun connectIssuesToNotes() {
        val issue1 = TestDataProvider.testIssues[0]
        val note1 = TestDataProvider.testNotes[0]

        val issue1Id = issue1.id ?: throw IllegalStateException("Issue ID cannot be null")
        val note1Id = note1.id ?: throw IllegalStateException("Note ID cannot be null")

        // Issue 1 -> Note 1
        val connection =
            IssueNoteConnection(
                id = "issue_${issue1Id}_note_$note1Id",
                from = issue1,
                to = note1,
            )
        issueNoteConnectionRepository.save(connection)
    }

    private fun connectIssuesToUsers() {
        val issue1 = TestDataProvider.testIssues[0]
        val user1 = TestDataProvider.testUsers[0]

        val issue1Id = issue1.id ?: throw IllegalStateException("Issue ID cannot be null")
        val user1Id = user1.id ?: throw IllegalStateException("User ID cannot be null")

        // Issue 1 -> User 1
        val connection =
            IssueUserConnection(
                id = "issue_${issue1Id}_user_$user1Id",
                from = issue1,
                to = user1,
            )
        issueUserConnectionRepository.save(connection)
    }

    private fun connectMergeRequestsToAccounts() {
        val mergeRequest1 = TestDataProvider.testMergeRequests[0]
        val account1 = TestDataProvider.testAccounts[0]

        val mergeRequest1Id = mergeRequest1.id ?: throw IllegalStateException("MergeRequest ID cannot be null")
        val account1Id = account1.id ?: throw IllegalStateException("Account ID cannot be null")

        // MergeRequest 1 -> Account 1
        val connection =
            MergeRequestAccountConnection(
                id = "mergeRequest_${mergeRequest1Id}_account_$account1Id",
                from = mergeRequest1,
                to = account1,
            )
        mergeRequestAccountConnectionRepository.save(connection)
    }

    private fun connectMergeRequestsToMilestones() {
        val mergeRequest1 = TestDataProvider.testMergeRequests[0]
        val milestone1 = TestDataProvider.testMilestones[0]

        val mergeRequest1Id = mergeRequest1.id ?: throw IllegalStateException("MergeRequest ID cannot be null")
        val milestone1Id = milestone1.id ?: throw IllegalStateException("Milestone ID cannot be null")

        // MergeRequest 1 -> Milestone 1
        val connection =
            MergeRequestMilestoneConnection(
                id = "mergeRequest_${mergeRequest1Id}_milestone_$milestone1Id",
                from = mergeRequest1,
                to = milestone1,
            )
        mergeRequestMilestoneConnectionRepository.save(connection)
    }

    private fun connectMergeRequestsToNotes() {
        val mergeRequest1 = TestDataProvider.testMergeRequests[0]
        val note1 = TestDataProvider.testNotes[0]

        val mergeRequest1Id = mergeRequest1.id ?: throw IllegalStateException("MergeRequest ID cannot be null")
        val note1Id = note1.id ?: throw IllegalStateException("Note ID cannot be null")

        // MergeRequest 1 -> Note 1
        val connection =
            MergeRequestNoteConnection(
                id = "mergeRequest_${mergeRequest1Id}_note_$note1Id",
                from = mergeRequest1,
                to = note1,
            )
        mergeRequestNoteConnectionRepository.save(connection)
    }

    private fun connectModulesToFiles() {
        val module1 = TestDataProvider.testModules[0]
        val file1 = TestDataProvider.testFiles[0]

        val module1Id = module1.id ?: throw IllegalStateException("Module ID cannot be null")
        val file1Id = file1.id ?: throw IllegalStateException("File ID cannot be null")

        // Module 1 -> File 1
        val connection =
            ModuleFileConnection(
                id = "module_${module1Id}_file_$file1Id",
                from = module1,
                to = file1,
            )
        moduleFileConnectionRepository.save(connection)
    }

    private fun connectModulesToModules() {
        val module1 = TestDataProvider.testModules[0]
        val module2 = TestDataProvider.testModules[1]

        val module1Id = module1.id ?: throw IllegalStateException("Module ID cannot be null")
        val module2Id = module2.id ?: throw IllegalStateException("Module ID cannot be null")

        // Module 1 -> Module 2 (Module 2 is a child of Module 1)
        val connection =
            ModuleModuleConnection(
                id = "module_${module1Id}_module_$module2Id",
                from = module1,
                to = module2,
            )
        moduleModuleConnectionRepository.save(connection)
    }

    private fun connectNotesToAccounts() {
        val note1 = TestDataProvider.testNotes[0]
        val account1 = TestDataProvider.testAccounts[0]

        val note1Id = note1.id ?: throw IllegalStateException("Note ID cannot be null")
        val account1Id = account1.id ?: throw IllegalStateException("Account ID cannot be null")

        // Note 1 -> Account 1
        val connection =
            NoteAccountConnection(
                id = "note_${note1Id}_account_$account1Id",
                from = note1,
                to = account1,
            )
        noteAccountConnectionRepository.save(connection)
    }

    private fun connectCommitFilesToUsers() {
        val commit1 = TestDataProvider.testCommits[0]
        val file1 = TestDataProvider.testFiles[0]
        val user1 = TestDataProvider.testUsers[0]

        val file1Id = file1.id ?: throw IllegalStateException("File ID cannot be null")
        val user1Id = user1.id ?: throw IllegalStateException("User ID cannot be null")

        // Create a CommitFileUserConnection
        val connection =
            CommitFileUserConnection(
                id = "file_${file1Id}_user_$user1Id",
                from = file1, // from File
                to = user1, // to User
            )
        commitFileUserConnectionRepository.save(connection)
    }
}
