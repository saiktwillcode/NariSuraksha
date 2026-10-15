/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
package com.narisurakshya.voxshield.sms

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.telephony.SmsManager
import android.util.Log
import android.webkit.JavascriptInterface

/**
 * Production SMS Service utility for Nari Surakshya / VoxShield Android client.
 * Intercepts CRITICAL/HIGH risk events and dispatches emergency text messages
 * via native Android SmsManager to trusted contacts (Mom: +91 98319 73989, Father: +91 70508 28554)
 * and local emergency services (e.g., 112).
 */
data class EmergencyEvent(
    val eventId: String,
    val riskLevel: String,
    val riskScore: Int,
    val timestamp: String,
    val mapLink: String
)

data class TrustedContact(
    val name: String,
    val phone: String,
    val verified: Boolean
)

class SmsEmergencyService(private val context: Context) {

    companion object {
        private const val TAG = "SmsEmergencyService"
        private const val ACTION_SMS_SENT = "COM.NARISURAKSHYA.VOXSHIELD.SMS_SENT"
        private const val ACTION_SMS_DELIVERED = "COM.NARISURAKSHYA.VOXSHIELD.SMS_DELIVERED"
        private const val EMERGENCY_POLICE_NUMBER = "112"
        const val DEFAULT_MOM_NUMBER = "+919831973989"
        const val DEFAULT_FATHER_NUMBER = "+917050828554"
    }

    init {
        registerBroadcastReceivers()
    }

    /**
     * WebView JavascriptInterface bridge so clicking TRIGGER INSTANT SOS (DISPATCH GPS)
     * dispatches real SIM SMS directly from the phone application without extra UI prompts.
     */
    @JavascriptInterface
    fun sendEmergencySms(recipientsCsv: String, messageBody: String) {
        val smsManager: SmsManager = context.getSystemService(SmsManager::class.java)
            ?: SmsManager.getDefault()

        val numbers = recipientsCsv.split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .ifEmpty { listOf(DEFAULT_MOM_NUMBER, DEFAULT_FATHER_NUMBER) }

        for (phone in numbers) {
            sendSmsToRecipient(smsManager, phone, messageBody)
            Log.i(TAG, "Auto-dispatched real SIM SMS to $phone")
        }
    }

    /**
     * Intercepts critical risk events and dispatches emergency SMS.
     */
    fun dispatchEmergencySms(event: EmergencyEvent, trustedContacts: List<TrustedContact>) {
        val smsManager: SmsManager = context.getSystemService(SmsManager::class.java)
            ?: SmsManager.getDefault()

        val emergencyMessage = buildEmergencyMessage(event)

        // 1. Send SMS to Local Emergency Services (Police / 112)
        sendSmsToRecipient(smsManager, EMERGENCY_POLICE_NUMBER, emergencyMessage)

        // 2. Send SMS to all verified Trusted Contacts
        for (contact in trustedContacts) {
            if (contact.verified) {
                sendSmsToRecipient(smsManager, contact.phone, emergencyMessage)
                Log.i(TAG, "Dispatched emergency SMS to trusted contact: ${contact.name} (${contact.phone})")
            }
        }
    }

    private fun buildEmergencyMessage(event: EmergencyEvent): String {
        return "EMERGENCY ALERT — NARI SURAKSHYA / VOXSHIELD\n" +
                "Risk Level: ${event.riskLevel} (${event.riskScore}/100)\n" +
                "Event ID: ${event.eventId}\n" +
                "Time: ${event.timestamp}\n" +
                "Location: ${event.mapLink}\n" +
                "Please contact immediately or notify authorities."
    }

    private fun sendSmsToRecipient(smsManager: SmsManager, phoneNumber: String, message: String) {
        try {
            val sentIntent = PendingIntent.getBroadcast(
                context, 0, Intent(ACTION_SMS_SENT), PendingIntent.FLAG_IMMUTABLE
            )
            val deliveredIntent = PendingIntent.getBroadcast(
                context, 0, Intent(ACTION_SMS_DELIVERED), PendingIntent.FLAG_IMMUTABLE
            )

            val parts = smsManager.divideMessage(message)
            if (parts.size > 1) {
                val sentIntents = ArrayList<PendingIntent>().apply { add(sentIntent) }
                val deliveredIntents = ArrayList<PendingIntent>().apply { add(deliveredIntent) }
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, sentIntents, deliveredIntents)
            } else {
                smsManager.sendTextMessage(phoneNumber, null, message, sentIntent, deliveredIntent)
            }
            Log.d(TAG, "SMS queued successfully for $phoneNumber")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send SMS to $phoneNumber", e)
        }
    }

    private fun registerBroadcastReceivers() {
        try {
            context.registerReceiver(object : BroadcastReceiver() {
                override fun onReceive(ctx: Context?, intent: Intent?) {
                    when (resultCode) {
                        android.app.Activity.RESULT_OK -> Log.i(TAG, "Emergency SMS sent successfully.")
                        SmsManager.RESULT_ERROR_GENERIC_FAILURE -> Log.e(TAG, "SMS error: Generic failure.")
                        SmsManager.RESULT_ERROR_NO_SERVICE -> Log.e(TAG, "SMS error: No service available.")
                    }
                }
            }, IntentFilter(ACTION_SMS_SENT), Context.RECEIVER_NOT_EXPORTED)
        } catch (e: Exception) {
            Log.e(TAG, "Error registering SMS broadcast receiver", e)
        }
    }
}
