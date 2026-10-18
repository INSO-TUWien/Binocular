package com.inso_world.binocular.infrastructure.test.repository.base

import com.inso_world.binocular.model.Repository
import org.junit.jupiter.api.BeforeEach

internal class BasePortSimpleDataTest : BasePortWithDataTest() {
    protected lateinit var simpleRepo: Repository

    @BeforeEach
    fun setupBase() {
        this.simpleRepo =
            requireNotNull(
                prepare(
                    "${FIXTURES_PATH}/${SIMPLE_REPO}",
                    projectName = SIMPLE_PROJECT_NAME,
                    branchName = "master"
                ).repo
            ) {
                "${FIXTURES_PATH}/${SIMPLE_REPO} repository cannot be null"
            }
    }
}
