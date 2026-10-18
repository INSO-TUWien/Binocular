package com.inso_world.binocular.cli.performance.commands

import com.inso_world.binocular.cli.commands.Index
import com.inso_world.binocular.cli.integration.utils.traverseGraph
import com.inso_world.binocular.cli.performance.commands.base.PerformanceTest
import com.inso_world.binocular.core.service.BranchInfrastructurePort
import com.inso_world.binocular.core.service.CommitInfrastructurePort
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.assertTimeout
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import java.time.Duration
import java.util.stream.Stream

internal class IndexCommandsTest : PerformanceTest() {
    @Autowired
    lateinit var idxClient: Index

    @Autowired
    private lateinit var projectPort: ProjectInfrastructurePort

    @Autowired
    private lateinit var commitPort: CommitInfrastructurePort

    @Autowired
    private lateinit var repositoryPort: RepositoryInfrastructurePort

    @Autowired
    private lateinit var branchPort: BranchInfrastructurePort

    companion object {
        @JvmStatic
        fun provideBranches(): Stream<Arguments> =
            Stream.of(
                Arguments.of(
                    "origin/not-merged/5",
                    "18a0a9eb68d8c38d14b83da4faee8f40f53bd019",
                    219,
                ),
                Arguments.of(
                    "origin/not-merged/31",
                    "fdc4fc21ed4eec0d0d49ec1677b590d67d361747",
                    592,
                ),
                Arguments.of(
                    "origin/not-merged/32",
                    "23a50b9d695f87bc8ec42291b67c0e7b703c6742",
                    658,
                ),
                Arguments.of(
                    "origin/main",
                    "0f19849be9b57d56285a57ea31f3622f8ddecdf6",
                    2456,
                ),
                Arguments.of(
                    "origin/develop",
                    "fb873518b4c369a6ff3ac0ec4d829124f9278c9e",
                    2092,
                ),
                Arguments.of(
                    "origin/feature/backend-new-gha",
                    "92b51617d96b2f32ec60512d5bba429272cb8c7a",
                    2238,
                ),
            )
    }

    @ParameterizedTest
    @MethodSource("provideBranches")
    fun `test commit idx, without validation`(
        branch: String,
        headSha: String,
        expectedCommits: Int,
    ) {
        idxClient.commits(
            repoPath = "../../.git",
            branchName = branch,
            projectName = "Binocular",
        )
    }

    @ParameterizedTest
    @MethodSource("provideBranches")
    @Disabled
    fun `test commit idx, with validation`(
        branch: String,
        headSha: String,
        expectedCommits: Int,
    ) {
//        warm up
        try {
            `test commit idx, without validation`(branch, headSha, expectedCommits)
        } catch (e: Exception) {
        }
        assertTimeout(Duration.ofMillis(600)) { `test commit idx, without validation`(branch, headSha, expectedCommits) }

        assertThat(projectPort.findAll()).hasSize(1)
        assertThat(
            projectPort
                .findAll()
                .toList()[0]
                .repo
                ?.commits,
        ).hasSize(expectedCommits)
        assertThat(repositoryPort.findAll()).hasSize(1)
        assertThat(branchPort.findAll()).hasSize(1)
        assertThat(commitPort.findAll()).hasSize(expectedCommits)

        run {
            val head =
                run {
                    val head = commitPort.findAll().filter { it.sha == headSha }

                    assertThat(head).hasSize(1)

                    head[0]
                }

            assertThat(head.sha).isEqualTo(headSha)

            val graph: MutableMap<String, Any?> = mutableMapOf()
            head.traverseGraph(graph)

            assertThat(graph.values).hasSize(expectedCommits)
        }
    }
}
