<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitModuleConnectionEntity.kt
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges
========
package com.inso_world.binocular.web.persistence.entity.arangodb.edges
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitModuleConnectionEntity.kt

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitModuleConnectionEntity.kt
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ModuleEntity
========
import com.inso_world.binocular.web.persistence.entity.arangodb.CommitEntity
import com.inso_world.binocular.web.persistence.entity.arangodb.ModuleEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitModuleConnectionEntity.kt
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a Commit and a Module.
 */
@Edge(value = "commits-modules")
data class CommitModuleConnectionEntity(
    @Id var id: String? = null,
    @From var from: CommitEntity,
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitModuleConnectionEntity.kt
    @To var to: ModuleEntity,
========
    @To var to: ModuleEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitModuleConnectionEntity.kt
)
