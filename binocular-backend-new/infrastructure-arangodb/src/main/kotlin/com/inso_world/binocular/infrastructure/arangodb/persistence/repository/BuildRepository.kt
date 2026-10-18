@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.BuildEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
interface BuildRepository :
    ArangoRepository<BuildEntity, String>,
    TechnicalIdentifiableRepository<BuildEntity> {
    @OptIn(ExperimentalUuidApi::class)
    override fun findByIid(iid: Uuid): BuildEntity?

    @com.arangodb.springframework.annotation.Query(
        """
        FOR b IN builds
          FILTER b.createdAt == null || DATE_TIMESTAMP(b.createdAt) <= @until
          SORT b.createdAt ASC, b.committedAt ASC, TO_NUMBER(b._key) ASC, b._key ASC
          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllUntilAsc(
        @org.springframework.data.repository.query.Param("offset") offset: Int,
        @org.springframework.data.repository.query.Param("size") size: Int,
        @org.springframework.data.repository.query.Param("until") until: Long
    ): List<BuildEntity>

    @com.arangodb.springframework.annotation.Query(
        """
        FOR b IN builds
          FILTER b.createdAt == null || DATE_TIMESTAMP(b.createdAt) <= @until
          SORT b.createdAt DESC, b.committedAt DESC, TO_NUMBER(b._key) DESC, b._key DESC
          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllUntilDesc(
        @org.springframework.data.repository.query.Param("offset") offset: Int,
        @org.springframework.data.repository.query.Param("size") size: Int,
        @org.springframework.data.repository.query.Param("until") until: Long
    ): List<BuildEntity>

    @com.arangodb.springframework.annotation.Query(
        """
        RETURN LENGTH(
          FOR b IN builds
            FILTER b.createdAt == null || DATE_TIMESTAMP(b.createdAt) <= @until
            RETURN 1
        )
        """
    )
    fun countAllUntil(
        @org.springframework.data.repository.query.Param("until") until: Long
    ): Long

    @com.arangodb.springframework.annotation.Query(
        """
        FOR b IN builds
          FILTER b.createdAt == null || DATE_TIMESTAMP(b.createdAt) >= @since
          SORT b.createdAt ASC, b.committedAt ASC, TO_NUMBER(b._key) ASC, b._key ASC
          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllSinceAsc(
        @org.springframework.data.repository.query.Param("offset") offset: Int,
        @org.springframework.data.repository.query.Param("size") size: Int,
        @org.springframework.data.repository.query.Param("since") since: Long
    ): List<BuildEntity>

    @com.arangodb.springframework.annotation.Query(
        """
        FOR b IN builds
          FILTER b.createdAt == null || DATE_TIMESTAMP(b.createdAt) >= @since
          SORT b.createdAt DESC, b.committedAt DESC, TO_NUMBER(b._key) DESC, b._key DESC
          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllSinceDesc(
        @org.springframework.data.repository.query.Param("offset") offset: Int,
        @org.springframework.data.repository.query.Param("size") size: Int,
        @org.springframework.data.repository.query.Param("since") since: Long
    ): List<BuildEntity>

    @com.arangodb.springframework.annotation.Query(
        """
        FOR b IN builds
          FILTER b.createdAt == null || (DATE_TIMESTAMP(b.createdAt) >= @since && DATE_TIMESTAMP(b.createdAt) <= @until)
          SORT b.createdAt ASC, b.committedAt ASC, TO_NUMBER(b._key) ASC, b._key ASC
          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllBetweenAsc(
        @org.springframework.data.repository.query.Param("offset") offset: Int,
        @org.springframework.data.repository.query.Param("size") size: Int,
        @org.springframework.data.repository.query.Param("since") since: Long,
        @org.springframework.data.repository.query.Param("until") until: Long
    ): List<BuildEntity>

    @com.arangodb.springframework.annotation.Query(
        """
        FOR b IN builds
          FILTER b.createdAt == null || (DATE_TIMESTAMP(b.createdAt) >= @since && DATE_TIMESTAMP(b.createdAt) <= @until)
          SORT b.createdAt DESC, b.committedAt DESC, TO_NUMBER(b._key) DESC, b._key DESC
          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllBetweenDesc(
        @org.springframework.data.repository.query.Param("offset") offset: Int,
        @org.springframework.data.repository.query.Param("size") size: Int,
        @org.springframework.data.repository.query.Param("since") since: Long,
        @org.springframework.data.repository.query.Param("until") until: Long
    ): List<BuildEntity>

    @com.arangodb.springframework.annotation.Query(
        """
        RETURN LENGTH(
          FOR b IN builds
            FILTER b.createdAt == null || DATE_TIMESTAMP(b.createdAt) >= @since
            RETURN 1
        )
        """
    )
    fun countAllSince(
        @org.springframework.data.repository.query.Param("since") since: Long
    ): Long

    @com.arangodb.springframework.annotation.Query(
        """
        RETURN LENGTH(
          FOR b IN builds
            FILTER b.createdAt == null || (DATE_TIMESTAMP(b.createdAt) >= @since && DATE_TIMESTAMP(b.createdAt) <= @until)
            RETURN 1
        )
        """
    )
    fun countAllBetween(
        @org.springframework.data.repository.query.Param("since") since: Long,
        @org.springframework.data.repository.query.Param("until") until: Long
    ): Long
}
