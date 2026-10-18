package com.inso_world.binocular.cli.commands

import com.inso_world.binocular.cli.service.ProjectService
import com.inso_world.binocular.cli.service.RepositoryService
import com.inso_world.binocular.cli.service.VcsService
import com.inso_world.binocular.cli.service.its.ItsService
import com.inso_world.binocular.ffi.GixIndexer
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.shell.command.annotation.Command
import org.springframework.shell.command.annotation.Option
import java.nio.file.Paths

@Command(
    command = ["index"],
    group = "Index Commands",
    description = "Commands for indexing repository and related data sources",
)
open class Index(
    @Autowired private val vcsService: VcsService,
    @Autowired private val repositoryService: RepositoryService,
    @Autowired private val projectService: ProjectService,
    @Autowired private val itsService: ItsService,
    @Autowired private val gixIndexer: GixIndexer,
) {
    companion object {
        private var logger: Logger = LoggerFactory.getLogger(Index::class.java)
    }

    // this is just to test the account indexing as accounts should be indexed together with issues
    @Command(command = ["accounts"], description = "Index accounts from ITS")
    open fun accounts(
        @Option(
            longNames = ["repo_owner"],
            shortNames = ['o'],
            required = true,
            description = "Owner of the repository on GitHub."
        ) repoOwner: String,
        @Option(
            longNames = ["repo_name"],
            shortNames = ['r'],
            required = true,
            description = "Name of the repository on GitHub."
        ) repoName: String,
        @Option(
            longNames = ["project_name"],
            shortNames = ['n'],
            required = true,
            description = "Custom name of the project.",
        ) projectName: String,
    ) {
        logger.trace(">>> index(owner: $repoOwner, name: $repoName)")
        logger.debug("Project '$projectName'")
        val project = this.projectService.getOrCreateProject(projectName)
        // warning: accounts are not indexed into a project
        itsService.indexAccountsFromGitHub(repoOwner, repoName, project).block()
        logger.trace("<<< index(owner: $repoOwner, name: $repoName)")
    }

    @Command(command = ["issues"], description = "Index issues from ITS")
    open fun issues(
        @Option(
            longNames = ["repo_owner"],
            shortNames = ['o'],
            required = true,
            description = "Owner of the repository on GitHub."
        ) repoOwner: String,
        @Option(
            longNames = ["repo_name"],
            shortNames = ['r'],
            required = true,
            description = "Name of the repository on GitHub."
        ) repoName: String,
        @Option(
            longNames = ["project_name"],
            shortNames = ['n'],
            required = true,
            description = "Custom name of the project.",
        ) projectName: String,
    ) {
        logger.trace(">>> index(owner: $repoOwner, name: $repoName)")
        logger.debug("Project '$projectName'")

        // get or create the project to index into
        val project = this.projectService.getOrCreateProject(projectName)

        // TODO the indexing is not done yet
        itsService.indexIssuesFromGitHub(repoOwner, repoName, project)
        logger.trace("<<< index(owner: $repoOwner, name: $repoName)")
    }

    @Command(command = ["commits"])
    open fun commits(
        repoPath: String,
        @Option(
            longNames = ["branch"],
            shortNames = ['b'],
            required = true,
        ) @NotNull @NotEmpty branchName: String,
        @Option(
            longNames = ["project_name"],
            shortNames = ['n'],
            required = true,
            description = "Custom name of the project.",
        ) @NotNull @NotEmpty projectName: String,
    ) {
        val path = repoPath.let { Paths.get(it).toRealPath() }
        logger.trace(">>> index($path, $branchName)")
        logger.debug("Project '$projectName'")
        val project = this.projectService.getOrCreateProject(projectName)
        vcsService.indexRepository(path.toString(), branchName, project)
        logger.trace("<<< index($path, $branchName)")
    }

    @Command(command = ["blames"])
    fun blames(
        @Option(longNames = ["batch"], defaultValue = "1000") batch: String,
    ) {
        logger.info("Calculating blames...")
        val batchSize = batch.toInt()
        var i = 1
//    val connections = commitCommitConnectionService.findAll();
//    connections.forEach {
//      println(it)
//    }
//    hashes.forEach {
//      it.parents.forEach { p -> p. }
//    }
    }

//  //  @Command(command = ["rust"])
//  fun rust() {
//    println("++++++++++ cartography ++++++++++")
//
//    val repo = findRepo();
//
//    println("p = $repo")
//
//    val cmt = findCommit(repo, "HEAD")
//    println("cmt = $cmt")
//
//    println("++++++++++ cartography ++++++++++")
//
//    val (values, traverseTime) = measureTimedValue {
//      traverse(repo, cmt, null)
//    };
//    println("CMD traverse took $traverseTime")
//
//    val hashes = values.map { it.commit }
//
//    val (diffs, diffsTime) = measureTimedValue {
//      diffs(
//        repo,
//        commitlist = hashes,
//        maxThreads = 12u,
//        skipMerges = false,
//        diffAlgorithm = GixDiffAlgorithm.HISTOGRAM,
//        breadthFirst = false,
//        follow = false,
//      )
//    };
//    println("CMD diffs took $diffsTime")
//
//    println("#diffs = ${diffs.count()}")
//
//    val groups = diffs.groupingBy { it.commit }
//      .fold(listOf<String>()) { acc, e -> acc + e.changeMap.keys }
//
//    val (blames, timeTaken) = measureTimedValue {
//      blames(
//        repo,
//        groups,
//        maxThreads = 12u,
//        diffAlgorithm = GixDiffAlgorithm.HISTOGRAM
//      )
//    }
//    println("CMD blames took $timeTaken")
//
//
//    println("#blames = ${blames.count()}")
//    println("#blames = ${blames.sumOf { it.blames.count() }}")
//    println("#blames = ${blames.sumOf { it -> it.blames.sumOf { it.entries.count() } }}")
//  }
}
