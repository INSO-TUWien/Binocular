@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.IssueEntity
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
interface IssueRepository :
    ArangoRepository<IssueEntity, String>,
    TechnicalIdentifiableRepository<IssueEntity> {
    @OptIn(ExperimentalUuidApi::class)
    override fun findByIid(iid: Uuid): IssueEntity?

    @Query(
        """
        FOR i IN issues
          FILTER i.createdAt == null || DATE_TIMESTAMP(i.createdAt) <= @until
          SORT i.createdAt ASC, TO_NUMBER(i._key) ASC, i._key ASC
          LIMIT @offset, @size
          RETURN i
        """
    )
    fun findAllUntilAsc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("until") until: Long
    ): List<IssueEntity>

    @Query(
        """
        FOR i IN issues
          FILTER i.createdAt == null || DATE_TIMESTAMP(i.createdAt) <= @until
          SORT i.createdAt DESC, TO_NUMBER(i._key) DESC, i._key DESC
          LIMIT @offset, @size
          RETURN i
        """
    )
    fun findAllUntilDesc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("until") until: Long
    ): List<IssueEntity>

    @Query(
        """
        RETURN LENGTH(
          FOR i IN issues
            FILTER i.createdAt == null || DATE_TIMESTAMP(i.createdAt) <= @until
            RETURN 1
        )
        """
    )
    fun countAllUntil(
        @Param("until") until: Long
    ): Long

    @Query(
        """
        FOR i IN issues
          FILTER i.createdAt == null || DATE_TIMESTAMP(i.createdAt) >= @since
          SORT i.createdAt ASC, TO_NUMBER(i._key) ASC, i._key ASC
          LIMIT @offset, @size
          RETURN i
        """
    )
    fun findAllSinceAsc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long
    ): List<IssueEntity>

    @Query(
        """
        FOR i IN issues
          FILTER i.createdAt == null || DATE_TIMESTAMP(i.createdAt) >= @since
          SORT i.createdAt DESC, TO_NUMBER(i._key) DESC, i._key DESC
          LIMIT @offset, @size
          RETURN i
        """
    )
    fun findAllSinceDesc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long
    ): List<IssueEntity>

    @Query(
        """
        FOR i IN issues
          FILTER i.createdAt == null || (DATE_TIMESTAMP(i.createdAt) >= @since && DATE_TIMESTAMP(i.createdAt) <= @until)
          SORT i.createdAt ASC, TO_NUMBER(i._key) ASC, i._key ASC
          LIMIT @offset, @size
          RETURN i
        """
    )
    fun findAllBetweenAsc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long,
        @Param("until") until: Long
    ): List<IssueEntity>

    @Query(
        """
        FOR i IN issues
          FILTER i.createdAt == null || (DATE_TIMESTAMP(i.createdAt) >= @since && DATE_TIMESTAMP(i.createdAt) <= @until)
          SORT i.createdAt DESC, TO_NUMBER(i._key) DESC, i._key DESC
          LIMIT @offset, @size
          RETURN i
        """
    )
    fun findAllBetweenDesc(
        @Param("offset") offset: Int,
        @Param("size") size: Int,
        @Param("since") since: Long,
        @Param("until") until: Long
    ): List<IssueEntity>

    @Query(
        """
        RETURN LENGTH(
          FOR i IN issues
            FILTER i.createdAt == null || DATE_TIMESTAMP(i.createdAt) >= @since
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
          FOR i IN issues
            FILTER i.createdAt == null || (DATE_TIMESTAMP(i.createdAt) >= @since AND DATE_TIMESTAMP(i.createdAt) <= @until)
            RETURN 1
        )
        """
    )
    fun countAllBetween(
        @Param("since") since: Long,
        @Param("until") until: Long
    ): Long
}
