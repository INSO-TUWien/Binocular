<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/IssueMilestoneConnectionEntity.kt
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges
========
package com.inso_world.binocular.web.persistence.entity.arangodb.edges
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/IssueMilestoneConnectionEntity.kt

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/IssueMilestoneConnectionEntity.kt
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MilestoneEntity
========
import com.inso_world.binocular.web.persistence.entity.arangodb.IssueEntity
import com.inso_world.binocular.web.persistence.entity.arangodb.MilestoneEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/IssueMilestoneConnectionEntity.kt
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between an Issue and a Milestone.
 */
@Edge(value = "issues-milestones")
data class IssueMilestoneConnectionEntity(
    @Id var id: String? = null,
    @From var from: IssueEntity,
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/IssueMilestoneConnectionEntity.kt
    @To var to: MilestoneEntity,
========
    @To var to: MilestoneEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/IssueMilestoneConnectionEntity.kt
)
