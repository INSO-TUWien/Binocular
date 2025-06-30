package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.AccountEntity
import com.inso_world.binocular.web.persistence.entity.sql.IssueEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between an Issue and an Account.
 */
@Entity
@Table(name = "issue_account_connections")
data class IssueAccountConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "issue_id", insertable = false, updatable = false)
  var issueId: String,

  @Column(name = "account_id", insertable = false, updatable = false)
  var accountId: String
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "")
}
