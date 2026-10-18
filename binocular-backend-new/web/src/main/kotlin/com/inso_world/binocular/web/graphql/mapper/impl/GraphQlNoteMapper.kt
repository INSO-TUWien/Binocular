package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Note
import com.inso_world.binocular.web.graphql.model.NoteDto
import org.springframework.stereotype.Component

@Component
class GraphQlNoteMapper {
    fun toDto(note: Note): NoteDto =
        NoteDto(
            id = note.id,
            body = note.body,
            createdAt = note.createdAt,
            updatedAt = note.updatedAt,
            system = note.system,
            resolvable = note.resolvable,
            confidential = note.confidential,
            internal = note.internal,
            imported = note.imported,
            importedFrom = note.importedFrom
        )
}
