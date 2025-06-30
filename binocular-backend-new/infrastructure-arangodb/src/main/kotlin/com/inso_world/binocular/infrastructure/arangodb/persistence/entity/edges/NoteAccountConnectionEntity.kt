<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/NoteAccountConnectionEntity.kt
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges
========
package com.inso_world.binocular.web.persistence.entity.arangodb.edges
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/NoteAccountConnectionEntity.kt

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/NoteAccountConnectionEntity.kt
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.NoteEntity
========
import com.inso_world.binocular.web.persistence.entity.arangodb.AccountEntity
import com.inso_world.binocular.web.persistence.entity.arangodb.NoteEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/NoteAccountConnectionEntity.kt
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a Note and an Account.
 */
@Edge(value = "notes-accounts")
data class NoteAccountConnectionEntity(
    @Id var id: String? = null,
    @From var from: NoteEntity,
<<<<<<<< HEAD:binocular-backend-new/infrastructure-arangodb/src/main/kotlin/com/inso_world/binocular/infrastructure/arangodb/persistence/entity/edges/NoteAccountConnectionEntity.kt
    @To var to: AccountEntity,
========
    @To var to: AccountEntity
>>>>>>>> e1bd9a8ab (#304: graphql with generic dao interfaces to support arangodb and sq - work on sql repos):binocular-backend-new/web/src/main/kotlin/com/inso_world/binocular/web/persistence/entity/arangodb/edges/NoteAccountConnectionEntity.kt
)
