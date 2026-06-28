package com.myaccountant.app.sms

data class SmsData(
    val bankName: String,
    val amount: Long,
    val type: String,
    val cardSuffix: String?,
    val message: String,
    val sender: String?,
    val timestamp: Long
) {
    fun toJson(): String {
        return """{"bankName":"$bankName","amount":$amount,"type":"$type","cardSuffix":"${cardSuffix ?: ""}","message":"${message.replace("\"", "\\\"")}","sender":"${sender ?: ""}","timestamp":$timestamp}"""
    }
}
