@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.INoteDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.NoteEntity
import com.inso_world.binocular.model.Note
import org.springframework.stereotype.Repository

@Repository
internal class NoteDao(
    private val noteRepository: com.inso_world.binocular.infrastructure.sql.persistence.repository.NoteRepository
) : SqlDao<NoteEntity, Long>(noteRepository),
    INoteDao {
    init {
        this.clazz = NoteEntity::class.java
        this.repository = noteRepository
    }

    override fun findById(id: Long): NoteEntity? = noteRepository.findById(id).orElse(null)

    override fun findByIid(iid: Any): NoteEntity? {
        val uIid: kotlin.uuid.Uuid =
            when (iid) {
                is Note.Id -> iid.value
                is kotlin.uuid.Uuid -> iid
                is String -> kotlin.uuid.Uuid.parse(iid)
                else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
            }
        return noteRepository.findByIid(uIid)
    }

    override fun findByIid(iid: Note.Id): NoteEntity? = findByIid(iid as Any)

    override fun findByIids(iids: Collection<Any>): List<NoteEntity> = iids.mapNotNull { findByIid(it) }

    override fun create(entity: NoteEntity): NoteEntity = noteRepository.save(entity)

    override fun update(entity: NoteEntity): NoteEntity = noteRepository.save(entity)
}
