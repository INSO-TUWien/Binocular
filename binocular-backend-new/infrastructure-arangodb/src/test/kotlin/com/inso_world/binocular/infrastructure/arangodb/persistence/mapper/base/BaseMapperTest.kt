package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.base

import com.inso_world.binocular.core.unit.base.BaseUnitTest
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.BranchMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.CommitMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.DeveloperMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.ProjectMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.RepositoryMapper
import io.mockk.spyk
import org.junit.jupiter.api.BeforeEach

internal open class BaseMapperTest : BaseUnitTest() {
    lateinit var projectMapper: ProjectMapper
    lateinit var repositoryMapper: RepositoryMapper
    lateinit var branchMapper: BranchMapper
    lateinit var developerMapper: DeveloperMapper
    lateinit var commitMapper: CommitMapper

    @BeforeEach
    fun setUp() {
        commitMapper = spyk(CommitMapper())
        branchMapper = spyk(BranchMapper())
        developerMapper = spyk(DeveloperMapper())
        repositoryMapper = spyk(RepositoryMapper())
        projectMapper = spyk(ProjectMapper())
    }
}
