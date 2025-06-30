package com.inso_world.binocular.web.config

import jakarta.persistence.EntityManagerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.env.Environment
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.orm.jpa.JpaTransactionManager
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.annotation.EnableTransactionManagement
import java.util.Properties
import javax.sql.DataSource

@Configuration
@Profile("sql")
@EnableTransactionManagement
@EntityScan("com.inso_world.binocular.web.persistence.entity.sql")
@EnableJpaRepositories("com.inso_world.binocular.web.persistence.repository.sql")
class SqlConfig {

    @Autowired
    private lateinit var env: Environment

    @Bean
    fun dataSource(): DataSource {
        val dataSource = DriverManagerDataSource()
        dataSource.setDriverClassName(env.getProperty("spring.datasource.driver-class-name") ?: "org.postgresql.Driver")
        dataSource.url = env.getProperty("spring.datasource.url") ?: "jdbc:postgresql://localhost:5432/binocular"
        dataSource.username = env.getProperty("spring.datasource.username") ?: "binocular"
        dataSource.password = env.getProperty("spring.datasource.password") ?: "binocular"
        return dataSource
    }

    @Bean
    fun entityManagerFactory(): LocalContainerEntityManagerFactoryBean {
        val em = LocalContainerEntityManagerFactoryBean()
        em.dataSource = dataSource()
        em.setPackagesToScan("com.inso_world.binocular.web.persistence.entity.sql")

        val vendorAdapter = HibernateJpaVendorAdapter()
        em.jpaVendorAdapter = vendorAdapter

        val properties = Properties()
        properties.setProperty("hibernate.dialect", env.getProperty("spring.jpa.database-platform") ?: "org.hibernate.dialect.PostgreSQLDialect")
        properties.setProperty("hibernate.hbm2ddl.auto", env.getProperty("spring.jpa.hibernate.ddl-auto") ?: "update")
        properties.setProperty("hibernate.show_sql", env.getProperty("spring.jpa.show-sql") ?: "true")
        properties.setProperty("hibernate.format_sql", env.getProperty("spring.jpa.properties.hibernate.format_sql") ?: "true")

        em.setJpaProperties(properties)

        return em
    }

    @Bean
    fun transactionManager(entityManagerFactory: EntityManagerFactory): PlatformTransactionManager {
        val transactionManager = JpaTransactionManager()
        transactionManager.entityManagerFactory = entityManagerFactory
        return transactionManager
    }
}
