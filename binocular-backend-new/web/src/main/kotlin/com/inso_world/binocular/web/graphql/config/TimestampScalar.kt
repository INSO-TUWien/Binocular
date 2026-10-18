package com.inso_world.binocular.web.graphql.config

import com.sun.jdi.LongValue
import graphql.language.IntValue
import graphql.language.StringValue
import graphql.schema.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.graphql.execution.RuntimeWiringConfigurer
import java.time.*
import java.time.format.DateTimeFormatter

@Configuration
class TimestampScalar {
    private val isoUtcMillis: DateTimeFormatter =
        DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .withZone(ZoneOffset.UTC)

    @Bean
    fun timestampScalarConfigurer(): RuntimeWiringConfigurer {
        val scalar =
            GraphQLScalarType
                .newScalar()
                .name("Timestamp")
                .description("ISO-8601 timestamp in UTC with milliseconds")
                .coercing(
                    object : Coercing<Any, String> {
                        override fun serialize(dataFetcherResult: Any): String =
                            isoUtcMillis.format(toInstant(dataFetcherResult, serialize = true))

                        override fun parseValue(input: Any): Instant = toInstant(input, serialize = false)

                        override fun parseLiteral(input: Any): Instant =
                            when (input) {
                                is IntValue -> Instant.ofEpochMilli(input.value.toLong())
                                is LongValue -> Instant.ofEpochMilli(input.value())
                                is StringValue -> parseString(input.value)
                                else -> literalError(input)
                            }
                    }
                ).build()

        return RuntimeWiringConfigurer { it.scalar(scalar) }
    }

    private fun toInstant(
        value: Any,
        serialize: Boolean
    ): Instant =
        when (value) {
            is Instant -> value
            is LocalDateTime -> value.toInstant(ZoneOffset.UTC)
            is Long -> Instant.ofEpochMilli(value)
            is Int -> Instant.ofEpochMilli(value.toLong())
            is String -> parseString(value)
            else -> if (serialize) serializeError(value) else valueError(value)
        }

    private fun parseString(value: String): Instant {
        val v = value.trim()

        v.toLongOrNull()?.let { return Instant.ofEpochMilli(it) }

        return runCatching { Instant.parse(v) }.getOrNull()
            ?: runCatching {
                LocalDateTime
                    .parse(v, DateTimeFormatter.ISO_DATE_TIME)
                    .toInstant(ZoneOffset.UTC)
            }.getOrNull()
            ?: throw CoercingParseValueException(
                "Expected epoch millis or ISO-8601 timestamp but was '$value'"
            )
    }

    private fun serializeError(value: Any): Nothing =
        throw CoercingSerializeException(
            "Expected Long/Int/String/Instant/LocalDateTime but was ${value::class.java.name}"
        )

    private fun valueError(value: Any): Nothing =
        throw CoercingParseValueException(
            "Expected Long/Int/String/Instant but was ${value::class.java.name}"
        )

    private fun literalError(value: Any): Nothing =
        throw CoercingParseLiteralException(
            "Expected Int, Long or String literal but was $value"
        )
}
