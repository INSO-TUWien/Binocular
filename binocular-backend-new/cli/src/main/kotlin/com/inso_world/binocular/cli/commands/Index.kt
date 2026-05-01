package com.inso_world.binocular.cli.commands

import com.inso_world.binocular.cli.service.ProjectService
import com.inso_world.binocular.cli.service.RepositoryService
import com.inso_world.binocular.cli.service.VcsService
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
) {
    companion object {
        private var logger: Logger = LoggerFactory.getLogger(Index::class.java)
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
        @Option(
            longNames = ["lizard-active"],
            shortNames = ['l'],
            required = false,
            description = "If lizard should be used",
        ) lizardActive: Boolean,
        @Option(
            longNames = ["lizard_include"],
            shortNames = ['x'],
            required = false,
            defaultValue = "backend\\src, frontend\\src",
            description = "Optional folders to be analzyed by lizard, there are default values",
        ) lizardInclude: String?,
        @Option(
            longNames = ["lizard_threads"],
            shortNames = ['t'],
            required = false,
            defaultValue = "1",
            description = "How many threads should be used for lizard",
        ) lizardThreads: Int,
    ) {
        val path = repoPath.let { Paths.get(it).toRealPath() }
        logger.trace(">>> index($path, $branchName)")
        logger.debug("Project '$projectName'")
        if (lizardActive) {
            logger.debug("Lizard active")
            logger.debug("Lizards scope includes path(s): [{}]", lizardInclude)
            logger.debug("Lizard number of threads: {}", lizardThreads)
        } else {
            logger.debug("Lizard inactive")
        }
        val project = this.projectService.getOrCreateProject(projectName)
        vcsService.indexRepository(path.toString(), branchName, project, lizardActive, lizardInclude, lizardThreads)
        logger.trace("<<< index($path, $branchName)")
    }
}
