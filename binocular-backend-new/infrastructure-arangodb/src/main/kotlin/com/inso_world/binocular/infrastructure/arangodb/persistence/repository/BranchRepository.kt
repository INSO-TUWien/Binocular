package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.BranchEntity
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface BranchRepository :
    ArangoRepository<BranchEntity, String>,
    TechnicalIdentifiableRepository<BranchEntity> {
    override fun findByIid(iid: Uuid): BranchEntity?

    @Query("FOR b IN branches FILTER b.repository.localPath == @repoPath AND b.branch == @name RETURN b")
    fun findByRepositoryAndName(
        @Param("repoPath") repoPath: String,
        @Param("name") name: String
    ): BranchEntity?

    /**
     * Returns branches sorted in ascending order using a deterministic,
     * domain-aware sort strategy.
     *
     * Sorting rules (applied in this order):
     * 1. Numeric-only branches
     * 2. `feature/<*>` branches containing a dash
     * 3. `feature/<*>` branches without a dash
     * 4. All other branches
     *
     * Within each group:
     * - branches containing `jira` (case-insensitive) are ordered first
     * - numeric values are compared numerically (not lexicographically)
     * - branch name is used as a final alphabetical fallback
     *
     * @param offset zero-based offset for pagination
     * @param size maximum number of branches to return
     * @return a list of sorted [BranchEntity] objects
     */
    @Query(
        """
        FOR b IN branches
          LET br        = b.branch
          LET isNum     = REGEX_TEST(br, '^[0-9]+$')
          LET isFeature = STARTS_WITH(br, 'feature/')
          LET featRema  = SUBSTRING(br, 8)
          LET hasDash   = isFeature && CONTAINS(featRema, '-')

          LET rank =
            isNum     ? 0 :
            hasDash   ? 1 :
            isFeature ? 2 :
                        3

          LET jiraPri = CONTAINS(LOWER(br), 'jira') ? 0 : 1

          LET parts = REGEX_SPLIT(featRema, '[^0-9]+')
          LET fNum  =
            LENGTH(parts) > 0 && LENGTH(parts[0]) > 0
              ? TO_NUMBER(parts[0])
              : null

          LET numValue =
            IS_NUMBER(fNum) ? fNum :
            isNum           ? TO_NUMBER(br) :
                              2147483647

          SORT
            rank     ASC,
            jiraPri ASC,
            numValue ASC,
            br       ASC

          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllSortedAsc(
        @Param("offset") offset: Int,
        @Param("size") size: Int
    ): List<BranchEntity>

    /**
     * Returns branches sorted in descending order using the same
     * deterministic, domain-aware sort strategy as [findAllSortedAsc].
     *
     * @param offset zero-based offset for pagination
     * @param size maximum number of branches to return
     * @return a list of sorted [BranchEntity] objects
     */
    @Query(
        """
        FOR b IN branches
          LET br        = b.branch
          LET isNum     = REGEX_TEST(br, '^[0-9]+$')
          LET isFeature = STARTS_WITH(br, 'feature/')
          LET featRema  = SUBSTRING(br, 8)
          LET hasDash   = isFeature && CONTAINS(featRema, '-')

          LET rank =
            isNum     ? 0 :
            hasDash   ? 1 :
            isFeature ? 2 :
                        3

          LET jiraPri = CONTAINS(LOWER(br), 'jira') ? 0 : 1

          LET parts = REGEX_SPLIT(featRema, '[^0-9]+')
          LET fNum  =
            LENGTH(parts) > 0 && LENGTH(parts[0]) > 0
              ? TO_NUMBER(parts[0])
              : null

          LET numValue =
            IS_NUMBER(fNum) ? fNum :
            isNum           ? TO_NUMBER(br) :
                              2147483647

          SORT
            rank     DESC,
            jiraPri DESC,
            numValue DESC,
            br       DESC

          LIMIT @offset, @size
          RETURN b
        """
    )
    fun findAllSortedDesc(
        @Param("offset") offset: Int,
        @Param("size") size: Int
    ): List<BranchEntity>
}
