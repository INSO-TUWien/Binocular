package com.inso_world.binocular.infrastructure.sql.unit.mapper

import com.inso_world.binocular.infrastructure.sql.TestData
import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.sql.unit.mapper.base.BaseMapperTest
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Platform
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import kotlin.test.assertEquals
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
internal class AccountMapperTest : BaseMapperTest() {
    @Nested
    inner class ToDomainMapperTest {
        @Test
        fun `should map account entity to domain`() {
            val projectEntity =
                TestData.Entity.testProjectEntity(
                    name = "TestProject",
                    id = 1L,
                    description = "A test project"
                )

            val accountEntity =
                AccountEntity(
                    id = 1L,
                    gid = "MDQ9JXMlcjY5MoB7Nah4",
                    name = "test",
                    login = "test",
                    url = "https://github.com/test",
                    avatarUrl = "https://avatars.githubusercontent.com/test",
                    platform = Platform.GitHub,
                    iid = Account.Id(Uuid.random()),
//                project = projectEntity
                )

            // map to domain
            val accountDomain = accountMapper.toDomain(accountEntity)
            assertAll(
                { assertEquals(accountEntity.id.toString(), accountDomain.id) },
                { assertEquals(accountEntity.name, accountDomain.name) },
                { assertEquals(accountEntity.login, accountDomain.login) },
                { assertEquals(accountEntity.url, accountDomain.url) },
                { assertEquals(accountEntity.avatarUrl, accountDomain.avatarUrl) },
                { assertEquals(accountEntity.platform, accountDomain.platform) }
            )
        }

        @Test
        fun `should map list of account entities to domain list`() {
            val projectEntity =
                TestData.Entity.testProjectEntity(
                    name = "TestProject",
                    id = 1L,
                    description = "A test project"
                )

            val accountEntities =
                listOf(
                    AccountEntity(
                        id = 1L,
                        gid = "MDQ9JXMlcjY5MoB7Nah4",
                        name = "Alice",
                        login = "alice123",
                        url = "https://github.com/alice123",
                        avatarUrl = "https://avatars.githubusercontent.com/alice123",
                        platform = Platform.GitHub,
                        iid = Account.Id(Uuid.random()),
//                    project = projectEntity
                    ),
                    AccountEntity(
                        id = 2L,
                        gid = "MDQ9JXMlcjiZ9MoB7Nah4",
                        name = "Bob",
                        login = "bob456",
                        url = "https://github.com/bob456",
                        avatarUrl = "https://avatars.githubusercontent.com/bob456",
                        platform = Platform.GitHub,
                        iid = Account.Id(Uuid.random()),
//                    project = projectEntity
                    )
                )

            val domainAccounts = accountMapper.toDomainList(accountEntities)

            assertEquals(accountEntities.size, domainAccounts.size)

            accountEntities.zip(domainAccounts).forEach { (entity, domain) ->
                assertAll(
                    { assertEquals(entity.id.toString(), domain.id) },
                    { assertEquals(entity.name, domain.name) },
                    { assertEquals(entity.login, domain.login) },
                    { assertEquals(entity.url, domain.url) },
                    { assertEquals(entity.avatarUrl, domain.avatarUrl) },
                    { assertEquals(entity.platform, domain.platform) },
                )
            }
        }
    }

    @Nested
    inner class ToEntityMapperTest {
        @Test
        fun `should map domain account to entity`() {
            val project =
                TestData.Domain.testProject(
                    name = "projectEntity.name",
                    description = "projectEntity.description"
                )

            val domainAccount =
                Account(
                    gid = "MDQ9JXMlcjY5MoB7Nah4",
                    login = "alice123",
                    platform = Platform.GitHub,
//                project = project
                ).apply {
                    this.id = "1"
                    this.name = "Alice"
                    this.url = "https://github.com/alice123"
                    this.avatarUrl = "https://avatars.githubusercontent.com/alice123"
                }

            val accountEntity = accountMapper.toEntity(domainAccount)

            assertAll(
                { assertEquals(domainAccount.id?.toLong(), accountEntity.id) },
                { assertEquals(domainAccount.name, accountEntity.name) },
                { assertEquals(domainAccount.login, accountEntity.login) },
                { assertEquals(domainAccount.url, accountEntity.url) },
                { assertEquals(domainAccount.avatarUrl, accountEntity.avatarUrl) },
                { assertEquals(domainAccount.platform, accountEntity.platform) }
            )
        }
    }
}
