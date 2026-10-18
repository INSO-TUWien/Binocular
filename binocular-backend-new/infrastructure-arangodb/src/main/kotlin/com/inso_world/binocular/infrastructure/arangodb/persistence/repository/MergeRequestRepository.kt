@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MergeRequestEntity
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
interface MergeRequestRepository :
    ArangoRepository<MergeRequestEntity, String>,
    TechnicalIdentifiableRepository<MergeRequestEntity> {
    @OptIn(ExperimentalUuidApi::class)
    override fun findByIid(iid: Uuid): MergeRequestEntity?

    @Query(
        """
        FOR m IN mergeRequests
          FILTER m.createdAt == null || DATE_TIMESTAMP(m.createdAt) <= @until
          SORT m.createdAt ASC, TO_NUMBER(m._key) ASC, m._key ASC
          LIMIT @offset, @size
          RETURN m
        """
    )
    fun findAllUntilAsc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("until") until: Long
    ): List<MergeRequestEntity>

    @Query(
        """
        FOR m IN mergeRequests
          FILTER m.createdAt == null || DATE_TIMESTAMP(m.createdAt) <= @until
          SORT m.createdAt DESC, TO_NUMBER(m._key) DESC, m._key DESC
          LIMIT @offset, @size
          RETURN m
        """
    )
    fun findAllUntilDesc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("until") until: Long
    ): List<MergeRequestEntity>

    @Query(
        """
        RETURN LENGTH(
          FOR m IN mergeRequests
            FILTER m.createdAt == null || DATE_TIMESTAMP(m.createdAt) <= @until
            RETURN 1
        )
        """
    )
    fun countAllUntil(
        @Param("until") until: Long
    ): Long

    @Query(
        """
        FOR m IN mergeRequests
          FILTER m.createdAt == null || DATE_TIMESTAMP(m.createdAt) >= @since
          SORT m.createdAt ASC, TO_NUMBER(m._key) ASC, m._key ASC
          LIMIT @offset, @size
          RETURN m
        """
    )
    fun findAllSinceAsc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long
    ): List<MergeRequestEntity>

    @Query(
        """
        FOR m IN mergeRequests
          FILTER m.createdAt == null || DATE_TIMESTAMP(m.createdAt) >= @since
          SORT m.createdAt DESC, TO_NUMBER(m._key) DESC, m._key DESC
          LIMIT @offset, @size
          RETURN m
        """
    )
    fun findAllSinceDesc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long
    ): List<MergeRequestEntity>

    @Query(
        """
        FOR m IN mergeRequests
          FILTER m.createdAt == null || (DATE_TIMESTAMP(m.createdAt) >= @since && DATE_TIMESTAMP(m.createdAt) <= @until)
          SORT m.createdAt ASC, TO_NUMBER(m._key) ASC, m._key ASC
          LIMIT @offset, @size
          RETURN m
        """
    )
    fun findAllBetweenAsc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long,
        @Param("until") until: Long
    ): List<MergeRequestEntity>

    @Query(
        """
        FOR m IN mergeRequests
          FILTER m.createdAt == null || (DATE_TIMESTAMP(m.createdAt) >= @since && DATE_TIMESTAMP(m.createdAt) <= @until)
          SORT m.createdAt DESC, TO_NUMBER(m._key) DESC, m._key DESC
          LIMIT @offset, @size
          RETURN m
        """
    )
    fun findAllBetweenDesc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long,
        @Param("until") until: Long
    ): List<MergeRequestEntity>

    @Query(
        """
        RETURN LENGTH(
          FOR m IN mergeRequests
            FILTER m.createdAt == null || DATE_TIMESTAMP(m.createdAt) >= @since
            RETURN 1
        )
        """
    )
    fun countAllSince(
        @Param("since") since: Long
    ): Long

    @Query(
        """
        RETURN LENGTH(
          FOR m IN mergeRequests
            FILTER m.createdAt == null || (DATE_TIMESTAMP(m.createdAt) >= @since AND DATE_TIMESTAMP(m.createdAt) <= @until)
            RETURN 1
        )
        """
    )
    fun countAllBetween(
        @Param("since") since: Long,
        @Param("until") until: Long
    ): Long
}
