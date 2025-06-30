<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitUserConnectionEntity.kt
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges
========
package com.inso_world.binocular.web.persistence.entity.arangodb.edges
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitUserConnectionEntity.kt

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitUserConnectionEntity.kt
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.UserEntity
========
import com.inso_world.binocular.web.persistence.entity.arangodb.CommitEntity
import com.inso_world.binocular.web.persistence.entity.arangodb.UserEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitUserConnectionEntity.kt
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a Commit and a User.
 */
@Edge(value = "commits-users")
data class CommitUserConnectionEntity(
    @Id var id: String? = null,
    @From var from: CommitEntity,
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitUserConnectionEntity.kt
    @To var to: UserEntity,
========
    @To var to: UserEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitUserConnectionEntity.kt
)
