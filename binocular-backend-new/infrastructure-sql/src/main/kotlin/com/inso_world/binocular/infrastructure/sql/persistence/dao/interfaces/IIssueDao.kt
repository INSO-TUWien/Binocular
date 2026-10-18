package com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces

import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Project
import java.util.stream.Stream

internal interface IIssueDao : IDao<IssueEntity, Long> {
    fun findAllByIidIn(iids: Collection<Issue.Id>): List<IssueEntity>

    fun findAllByUser(user: DeveloperEntity): Stream<IssueEntity>

    fun findExistingGid(
        project: Project,
        ids: List<String>
    ): Iterable<IssueEntity>
}
