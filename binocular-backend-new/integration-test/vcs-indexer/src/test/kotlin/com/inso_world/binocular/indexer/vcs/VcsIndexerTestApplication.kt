package com.inso_world.binocular.indexer.vcs

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * Test application for VCS indexer integration tests.
 *
 * This application supports both gix (FFI) and jgit profiles for testing
 * different Git indexer implementations.
 *
 * Use `-Dspring.profiles.active=gix` for FFI-based indexing.
 * Use `-Dspring.profiles.active=jgit` for JGit-based indexing.
 */
@SpringBootApplication(
    scanBasePackages = [
        "com.inso_world.binocular.indexer.vcs.config",
        "com.inso_world.binocular.core",
    ],
)
open class VcsIndexerTestApplication

fun main(args: Array<String>) {
    runApplication<VcsIndexerTestApplication>(*args)
}
