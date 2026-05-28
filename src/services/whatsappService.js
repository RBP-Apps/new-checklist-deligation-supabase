import supabase from "../SupabaseClient";

/**
 * WhatsApp Messaging Service
 * Sends task notifications to users via WhatsApp
 */


// WhatsApp API Configuration
// WhatsApp API Configuration (Meta Cloud API)
const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_WABA_ID = import.meta.env.VITE_WHATSAPP_WABA_ID;

const APP_LINK = "https://new-checklist-deligation-supabase-q.vercel.app/login";


/**
 * Format phone number to international format
 * @param {string} phone - Phone number (can be with or without country code)
 * @returns {string} - Formatted phone number with country code
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return null;

    // Remove all non-digit characters
    let cleaned = String(phone).replace(/\D/g, '');

    // If doesn't start with country code, assume India (+91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    return cleaned;
};

/**
 * Get user phone number from database
 * @param {string} username - Username to fetch phone for
 * @returns {Promise<string|null>} - Phone number or null
 */
const getUserPhoneNumber = async (username) => {
    try {
        console.log(`🔍 Fetching phone for user: "${username}"`);
        const { data, error } = await supabase
            .from('new_users')
            .select('number')
            .eq('user_name', username)
            .limit(1);

        if (error) {
            console.error('Supabase User Fetch Error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn(`⚠️ User "${username}" not found in database.`);
            return null;
        }

        return data[0]?.number || null;
    } catch (error) {
        console.error('Error fetching user phone:', error);
        return null;
    }
};

/**
 * Send WhatsApp message using Meta API
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Message text
 * @returns {Promise<boolean>} - Success status
 */
const sendWhatsAppMessage = async (phoneNumber, message) => {
    try {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!formattedPhone) {
            console.error('Invalid phone number:', phoneNumber);
            return false;
        }

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            console.error('Meta WhatsApp API Error: Credentials not configured');
            return false;
        }

        const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "text",
                text: {
                    body: message
                }
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Meta WhatsApp API Error:', response.status, response.statusText);
            console.error('Meta WhatsApp API Error Response:', JSON.stringify(result, null, 2));
            return false;
        }

        console.log('✅ WhatsApp message sent successfully via Meta:', result);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return false;
    }
};

/**
 * Send WhatsApp message using Meta Template API
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} templateName - Name of the template
 * @param {Array} parameters - Array of parameter values for the template
 * @param {string} languageCode - Language code (default: 'en')
 * @returns {Promise<boolean>} - Success status
 */
const sendWhatsAppTemplate = async (phoneNumber, templateName, parameters = [], languageCode = 'en') => {
    try {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!formattedPhone) {
            console.error('Invalid phone number:', phoneNumber);
            return false;
        }

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            console.error(`Meta Template API Error: Credentials not configured for ${templateName}`);
            return false;
        }

        const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const body = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: languageCode
                },
                components: [
                    {
                        type: "body",
                        parameters: parameters.map(val => ({
                            type: "text",
                            text: String(val || 'N/A')
                        }))
                    }
                ]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`Meta Template API Error (${templateName}):`, response.status, response.statusText);
            console.error('Response:', JSON.stringify(result, null, 2));
            return false;
        }

        console.log(`✅ WhatsApp template "${templateName}" sent successfully:`, result);
        return true;
    } catch (error) {
        console.error(`Error sending WhatsApp template "${templateName}":`, error);
        return false;
    }
};

/**
 * Send WhatsApp voice message (PTT/Audio) using Meta API
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} audioUrl - Public URL of the audio file
 * @returns {Promise<boolean>} - Success status
 */
const sendWhatsAppVoiceMessage = async (phoneNumber, audioUrl) => {
    try {
        const formattedPhone = formatPhoneNumber(phoneNumber);

        if (!formattedPhone) {
            console.error('Invalid phone number for voice message:', phoneNumber);
            return false;
        }

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            console.error('Meta WhatsApp Voice API Error: Credentials not configured');
            return false;
        }

        const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "audio",
                audio: {
                    link: audioUrl
                }
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Meta WhatsApp Voice API Error:', response.status, response.statusText);
            console.error('Meta WhatsApp Voice API Error Response:', JSON.stringify(result, null, 2));
            return false;
        }

        console.log('✅ WhatsApp voice message sent successfully via Meta:', result);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp voice message:', error);
        return false;
    }
};

/**
 * Send urgent task notification
 */
export const sendUrgentTaskNotification = async (taskDetails) => {
    try {
        const {
            doerName,
            taskId,
            description,
            dueDate,
            givenBy,
        } = taskDetails;

        const phoneNumber = await getUserPhoneNumber(doerName);
        if (!phoneNumber) return false;

        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
        const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note: ${audioUrl}` : description;

        // Template: task_assignment_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} allocatedBy (givenBy), {{4}} description, {{5}} deadline
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'task_assignment_notification',
            [doerName, taskId, givenBy, displayDescription, dueDate],
            'en_US'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }
        return sent;
    } catch (error) {
        console.error('Error sending urgent notification:', error);
        return false;
    }
};

/**
 * Send checklist task notification
 */
export const sendChecklistTaskNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, description, startDate, givenBy, department, duration } = taskDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);
        if (!phoneNumber) return false;

        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
        const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note: ${audioUrl}` : description;

        const descriptionText = `${displayDescription || ''}\nDepartment: ${department || 'N/A'}\nDuration: ${duration || 'N/A'}`.trim();

        // Template: task_assignment_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} allocatedBy (givenBy), {{4}} description, {{5}} deadline
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'task_assignment_notification',
            [doerName, taskId, givenBy, descriptionText, startDate],
            'en_US'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }
        return sent;
    } catch (error) {
        console.error('Error sending checklist notification:', error);
        return false;
    }
};

/**
 * Send maintenance task notification
 */
export const sendMaintenanceTaskNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, description, startDate, givenBy, machineName, partName, department, duration } = taskDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);
        if (!phoneNumber) return false;

        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
        const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note: ${audioUrl}` : description;

        const descriptionText = `${displayDescription || ''}\nMachine: ${machineName || 'N/A'}\nPart: ${partName || 'N/A'}\nDepartment: ${department || 'N/A'}\nDuration: ${duration || 'N/A'}`.trim();

        // Template: task_assignment_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} allocatedBy (givenBy), {{4}} description, {{5}} deadline
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'task_assignment_notification',
            [doerName, taskId, givenBy, descriptionText, startDate],
            'en_US'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }
        return sent;
    } catch (error) {
        console.error('Error sending maintenance notification:', error);
        return false;
    }
};

/**
 * Send repair task notification
 */
export const sendRepairTaskNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, description, startDate, givenBy, machineName, department, duration } = taskDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);
        if (!phoneNumber) return false;

        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
        const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note: ${audioUrl}` : description;

        const descriptionText = `${displayDescription || ''}\nMachine: ${machineName || 'N/A'}\nDepartment: ${department || 'N/A'}\nDuration: ${duration || 'N/A'}`.trim();

        // Template: task_assignment_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} allocatedBy (givenBy), {{4}} description, {{5}} deadline
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'task_assignment_notification',
            [doerName, taskId, givenBy, descriptionText, startDate],
            'en_US'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }
        return sent;
    } catch (error) {
        console.error('Error sending repair notification:', error);
        return false;
    }
};

/**
 * Send EA task notification
 */
export const sendEATaskNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, description, startDate, givenBy, duration } = taskDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);
        if (!phoneNumber) return false;

        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
        const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note: ${audioUrl}` : description;

        // Template: ea_task_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} description, {{4}} startDate, {{5}} duration, {{6}} givenBy, {{7}} link
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'ea_task_notification',
            [doerName, taskId, displayDescription, startDate, duration || 'N/A', givenBy, APP_LINK],
            'en'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }
        return sent;
    } catch (error) {
        console.error('Error sending EA notification:', error);
        return false;
    }
};

/**
 * Send delegation task notification
 */
export const sendDelegationTaskNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, description, startDate, givenBy, department } = taskDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);
        if (!phoneNumber) return false;

        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
        const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note: ${audioUrl}` : description;

        // Template: new_task_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} department, {{4}} description, {{5}} startDate, {{6}} givenBy, {{7}} link
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'new_task_notification',
            [doerName, taskId, department || 'N/A', displayDescription, startDate, givenBy, APP_LINK],
            'en'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }
        return sent;
    } catch (error) {
        console.error('Error sending delegation notification:', error);
        return false;
    }
};

/**
 * Send task extension notification
 */
export const sendTaskExtensionNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, givenBy, description, nextExtendDate, sendTo } = taskDetails;
        const recipientName = sendTo === 'admin' ? givenBy : doerName;
        const phoneNumber = await getUserPhoneNumber(recipientName);

        if (!phoneNumber) return false;

        // Extract audio URL from description if present
        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);

        // If description is JUST the URL, enhance it
        const displayDescription = (audioUrl && description?.trim() === audioUrl)
            ? `🎤 Voice Note: ${audioUrl}`
            : description;

        // Template: task_extend_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} description, {{4}} nextExtendDate, {{5}} givenBy, {{6}} link
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'task_extend_notification',
            [doerName, taskId, displayDescription, nextExtendDate, givenBy, APP_LINK],
            'en'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }

        return sent;
    } catch (error) {
        console.error('Error sending extension notification:', error);
        return false;
    }
};

/**
 * Send task assignment notification (Delegation Task)
 */
export const sendTaskAssignmentNotification = async (taskDetails) => {
    const { taskType } = taskDetails;

    switch (taskType?.toLowerCase()) {
        case 'checklist':
            return sendChecklistTaskNotification(taskDetails);
        case 'maintenance':
            return sendMaintenanceTaskNotification(taskDetails);
        case 'repair':
            return sendRepairTaskNotification(taskDetails);
        case 'ea':
            return sendEATaskNotification(taskDetails);
        case 'delegation':
            return sendDelegationTaskNotification(taskDetails);
        default:
            // For backward compatibility or if type is not provided
            try {
                const {
                    doerName,
                    taskId,
                    givenBy,
                    description,
                    startDate,
                } = taskDetails;

                const phoneNumber = await getUserPhoneNumber(doerName);

                if (!phoneNumber) {
                    console.warn(`No phone number found for user: ${doerName}`);
                    return false;
                }

                const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
                const match = description && description.match(urlRegex);
                const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
                const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note Link: ${audioUrl}` : description;

                // Using new_task_notification template instead of raw text
                // Variables: {{1}} doerName, {{2}} taskId, {{3}} department, {{4}} description, {{5}} startDate, {{6}} givenBy, {{7}} link
                const sent = await sendWhatsAppTemplate(
                    phoneNumber,
                    'new_task_notification',
                    [doerName, taskId, 'N/A', displayDescription, startDate, givenBy, APP_LINK],
                    'en'
                );

                if (sent && audioUrl) {
                    await new Promise(r => setTimeout(r, 1000));
                    await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
                }
                return sent;
            } catch (error) {
                console.error('Error sending task assignment notification:', error);
                return false;
            }
    }
};

/**
 * DEPRECATED - use sendTaskAssignmentNotification
 */
const formatTaskMessage = (taskDetails) => {
    return "Please use specific notification functions";
};

/**
 * Send task reminder notification
 * @param {Object} taskDetails - Task details
 * @returns {Promise<boolean>} - Success status
 */
export const sendTaskReminderNotification = async (taskDetails) => {
    try {
        const { doerName, description, dueDate } = taskDetails;

        const phoneNumber = await getUserPhoneNumber(doerName);

        if (!phoneNumber) {
            console.warn(`No phone number found for user: ${doerName}`);
            return false;
        }

        const descriptionText = `Reminder: ${description || ''}\nDue Date: ${dueDate || 'N/A'}`;

        // Template: daily_reminder
        // Variables: {{1}} doerName, {{2}} totalTasks, {{3}} todayTasks, {{4}} pendingTasks, {{5}} focusTasks, {{6}} link
        return await sendWhatsAppTemplate(
            phoneNumber,
            'daily_reminder',
            [doerName, "1", "1", "1", descriptionText, APP_LINK],
            'en_US'
        );
    } catch (error) {
        console.error('Error sending task reminder:', error);
        return false;
    }
};

/**
 * Send task completion notification to admin
 * @param {Object} taskDetails - Task details
 * @returns {Promise<boolean>} - Success status
 */
export const sendTaskCompletionNotification = async (taskDetails) => {
    try {
        const { givenBy, doerName, description, completedAt } = taskDetails;

        const phoneNumber = await getUserPhoneNumber(givenBy);

        if (!phoneNumber) {
            console.warn(`No phone number found for admin: ${givenBy}`);
            return false;
        }

        // Template: task_completed_notification
        // Variables: {{1}} description, {{2}} completedAt, {{3}} doerName
        return await sendWhatsAppTemplate(
            phoneNumber,
            'task_completed_notification',
            [description, completedAt, doerName],
            'en'
        );
    } catch (error) {
        console.error('Error sending completion notification:', error);
        return false;
    }
};

/**
 * Send task rejection notification
 */
export const sendTaskRejectionNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, description, reason } = taskDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);

        if (!phoneNumber) {
            console.warn(`No phone number found for user: ${doerName}`);
            return false;
        }

        const descriptionText = `🚨 REJECTED SUBMISSION\nReason: ${reason || 'No reason provided'}\nDescription: ${description || 'N/A'}`;

        // Template: task_assignment_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} allocatedBy (Admin), {{4}} description, {{5}} deadline
        return await sendWhatsAppTemplate(
            phoneNumber,
            'task_assignment_notification',
            [doerName, taskId, 'Admin', descriptionText, 'N/A'],
            'en_US'
        );
    } catch (error) {
        console.error('Error sending rejection notification:', error);
        return false;
    }
};

/**
 * Send task reassignment notification (Shifted Task)
 */
export const sendTaskReassignmentNotification = async (taskDetails) => {
    try {
        const {
            newDoerName,
            originalDoerName,
            taskId,
            description,
            startDate,
            department,
            taskType
        } = taskDetails;

        const phoneNumber = await getUserPhoneNumber(newDoerName);
        if (!phoneNumber) return false;

        const urlRegex = /(https?:\/\/[^\s]+(?:voice-notes|audio-recordings)[^\s]*\.(?:mp3|ogg|wav|webm|m4a)?)/i;
        const match = description && description.match(urlRegex);
        const audioUrl = taskDetails.audioUrl || (match ? match[0] : null);
        const displayDescription = (audioUrl && description?.trim() === audioUrl) ? `🎤 Voice Note: ${audioUrl}` : description;

        // Template: task_transfer_notification
        // Variables: {{1}} newDoerName, {{2}} taskId, {{3}} taskType, {{4}} department, {{5}} description, {{6}} Date, {{7}} Link, {{8}} originalDoerName
        const sent = await sendWhatsAppTemplate(
            phoneNumber,
            'task_transfer_notification',
            [newDoerName, taskId, taskType || 'TASK', department || 'N/A', displayDescription, startDate, APP_LINK, originalDoerName],
            'en'
        );

        if (sent && audioUrl) {
            await new Promise(r => setTimeout(r, 1000));
            await sendWhatsAppVoiceMessage(phoneNumber, audioUrl);
        }
        return sent;
    } catch (error) {
        console.error('Error sending reassignment notification:', error);
        return false;
    }
};

/**
 * Send Password Reset OTP to Admin
 */
export const sendPasswordResetOTP = async (username, otp) => {
    try {
        const adminNumber = "9131749390";

        // Template: password_reset_otp
        // Variables: {{1}} username, {{2}} otp
        return await sendWhatsAppTemplate(
            adminNumber,
            'password_reset_otp',
            [username, otp]
        );
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        return false;
    }
};

/**
 * Send admin remark notification for task extension
 */
export const sendAdminExtensionRemarkNotification = async (taskDetails) => {
    try {
        const { doerName, taskId, description, remark } = taskDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);

        if (!phoneNumber) return false;

        const descriptionText = `${description || 'N/A'}\nAdmin Remark: ${remark || 'No remark provided'}`;

        // Template: task_extend_notification
        // Variables: {{1}} doerName, {{2}} taskId, {{3}} description, {{4}} nextExtendDate, {{5}} givenBy, {{6}} link
        return await sendWhatsAppTemplate(
            phoneNumber,
            'task_extend_notification',
            [doerName, taskId, descriptionText, 'N/A', 'Admin', APP_LINK],
            'en'
        );
    } catch (error) {
        console.error('Error sending extension remark notification:', error);
        return false;
    }
};

/**
 * Send daily task summary notification
 * @param {Object} summaryDetails - Summary details
 * @returns {Promise<boolean>} - Success status
 */
export const sendDailyTaskSummaryNotification = async (summaryDetails) => {
    try {
        const { doerName, totalTasks, pendingTasks, todayTasks } = summaryDetails;
        const phoneNumber = await getUserPhoneNumber(doerName);
        if (!phoneNumber) return false;

        const focusTasksText = summaryDetails.focusTasks || 'Please review all pending tasks';

        // Template: daily_reminder
        // Variables: {{1}} doerName, {{2}} totalTasks, {{3}} todayTasks, {{4}} pendingTasks, {{5}} focusTasks, {{6}} link
        return await sendWhatsAppTemplate(
            phoneNumber,
            'daily_reminder',
            [doerName, totalTasks, todayTasks, pendingTasks, focusTasksText, APP_LINK],
            'en_US'
        );
    } catch (error) {
        console.error('Error sending daily task summary:', error);
        return false;
    }
};

/**
 * Send purchase delivered notification
 * @param {Object} deliveryDetails - Delivery details
 * @returns {Promise<boolean>} - Success status
 */
export const sendPurchaseDeliveredNotification = async (deliveryDetails) => {
    try {
        const { recipientName, transporterName, lrNo, date, productName, size1, size2 } = deliveryDetails;
        const phoneNumber = await getUserPhoneNumber(recipientName);
        if (!phoneNumber) return false;

        // Template: purchase_delivered
        // Variables: {{1}} TransporterName, {{2}} LRNo, {{3}} Date, {{4}} ProductName, {{5}} Size1, {{6}} Size2
        return await sendWhatsAppTemplate(
            phoneNumber,
            'purchase_delivered',
            [transporterName, lrNo, date, productName, size1, size2]
        );
    } catch (error) {
        console.error('Error sending purchase delivered notification:', error);
        return false;
    }
};

export default {
    sendUrgentTaskNotification,
    sendTaskExtensionNotification,
    sendTaskAssignmentNotification,
    sendChecklistTaskNotification,
    sendMaintenanceTaskNotification,
    sendRepairTaskNotification,
    sendEATaskNotification,
    sendDelegationTaskNotification,
    sendTaskReminderNotification,
    sendTaskCompletionNotification,
    sendTaskRejectionNotification,
    sendTaskReassignmentNotification,
    sendPasswordResetOTP,
    sendAdminExtensionRemarkNotification,
    sendDailyTaskSummaryNotification,
    sendPurchaseDeliveredNotification
};
