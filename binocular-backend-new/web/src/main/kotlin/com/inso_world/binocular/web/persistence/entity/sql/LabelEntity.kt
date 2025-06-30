package com.inso_world.binocular.web.persistence.entity.sql

import jakarta.persistence.*

/**
 * SQL-specific Label entity for storing issue and merge request labels.
 */
@Entity
@Table(name = "labels")
data class LabelEntity(
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  var id: Long? = null,

  var value: String,

  @Column(name = "issue_id", insertable = false, updatable = false)
  var issueId: String? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "issue_id")
  var issue: IssueEntity? = null,

  @Column(name = "merge_request_id", insertable = false, updatable = false)
  var mergeRequestId: String? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "merge_request_id")
  var mergeRequest: MergeRequestEntity? = null
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", null, null, null, null)
}
