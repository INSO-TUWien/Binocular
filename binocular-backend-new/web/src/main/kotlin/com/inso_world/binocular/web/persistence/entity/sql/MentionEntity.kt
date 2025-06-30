package com.inso_world.binocular.web.persistence.entity.sql

import jakarta.persistence.*
import java.util.*

/**
 * SQL-specific Mention entity for storing issue mentions.
 */
@Entity
@Table(name = "mentions")
data class MentionEntity(
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  var id: Long? = null,
  
  var commit: String? = null,
  
  @Column(name = "created_at")
  @Temporal(TemporalType.TIMESTAMP)
  var createdAt: Date? = null,
  
  var closes: Boolean? = null,
  
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
)
