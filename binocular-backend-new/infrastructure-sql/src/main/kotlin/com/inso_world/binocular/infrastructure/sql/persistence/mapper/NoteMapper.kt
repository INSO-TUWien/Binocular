package com.inso_world.binocular.infrastructure.sql.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.NoteEntity
import com.inso_world.binocular.model.Note
import org.springframework.stereotype.Component

@Component
internal class NoteMapper : EntityMapper<Note, NoteEntity> {
    override fun toEntity(domain: Note): NoteEntity =
        NoteEntity(
            id = domain.id?.toLongOrNull(),
            iid = domain.iid,
            body = domain.body,
            createdAt = domain.createdAt,
            updatedAt = domain.updatedAt,
            system = domain.system,
            resolvable = domain.resolvable,
            confidential = domain.confidential,
            internal = domain.internal,
            imported = domain.imported,
            importedFrom = domain.importedFrom
        )

    override fun toDomain(entity: NoteEntity): Note =
        Note(
            id = entity.id?.toString(),
            body = entity.body,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            system = entity.system,
            resolvable = entity.resolvable,
            confidential = entity.confidential,
            internal = entity.internal,
            imported = entity.imported,
            importedFrom = entity.importedFrom,
            iid = entity.iid
        ).apply {
            issueIds.addAll(entity.issues.map { it.iid })
            accountIds.addAll(entity.accounts.map { it.iid })
        }
}
