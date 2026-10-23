package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.serde.jackson.Id
import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity

@Edge(value = "projects-accounts")
class ProjectAccountConnectionEntity(
    @Id var id: String? = null,
    @From var from: ProjectEntity,
    @To var to: AccountEntity,
)
