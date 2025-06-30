<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitFileUserConnectionEntity.kt
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges
========
package com.inso_world.binocular.web.persistence.entity.arangodb.edges
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitFileUserConnectionEntity.kt

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/CommitFileUserConnectionEntity.kt
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.UserEntity
========
import com.inso_world.binocular.web.persistence.entity.arangodb.FileEntity
import com.inso_world.binocular.web.persistence.entity.arangodb.UserEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/CommitFileUserConnectionEntity.kt
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a File and a User.
 */
@Edge(value = "commit-files-users")
data class CommitFileUserConnectionEntity(
    @Id var id: String? = null,
    @From var from: FileEntity,
    @To var to: UserEntity,
)
