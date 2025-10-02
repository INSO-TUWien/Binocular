package base

import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Build
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Module
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.User

abstract class BaseInfrastructurePortTest {
    open val testAccounts: List<Account> = emptyList()
    open val testCommits: List<Commit> = emptyList()
    open val testBranches: List<Branch> = emptyList()
    open val testBuilds: List<Build> = emptyList()
    open val testFiles: List<File> = emptyList()
    open val testIssues: List<Issue> = emptyList()
    open val testMergeRequests: List<MergeRequest> = emptyList()
    open val testModules: List<Module> = emptyList()
    open val testNotes: List<Note> = emptyList()
    open val testUsers: List<User> = emptyList()
    open val testMilestones: List<Milestone> = emptyList()

    abstract fun setUp()

    abstract fun tearDown()
}
