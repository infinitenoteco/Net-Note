import { useCallback, useMemo } from "react";
import { useAppContext } from "../store/AppContext";

export type AppLanguage = "en" | "hi";

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    "New Note": "New Note",
    "Search Notes": "Search Notes",
    "Archived": "Archived",
    "Trash": "Trash",
    "Pinned": "Pinned",
    "Groups": "Groups",
    "All Notes": "All Notes",

    "Settings": "Settings",
    "Profile": "Profile",
    "Log out": "Log out",

    "Appearance": "Appearance",
    "Theme": "Theme",
    "Choose how NotePad looks": "Choose how NotePad looks",
    "Language": "Language",
    "Select your preferred language": "Select your preferred language",
    "Time Zone": "Time Zone",
    "Used for dates and times": "Used for dates and times",

    "light": "Light",
    "dark": "Dark",
    "system": "System",

    "Save": "Save",
    "Cancel": "Cancel",
    "Delete": "Delete",
    "Close": "Close",
    "Create": "Create",
    "Rename": "Rename",
    "Edit": "Edit",
    "Share": "Share",
    "Copy": "Copy",

    "No notes": "No notes",
    "No note selected": "No note selected",
    "Untitled": "Untitled",

    "Today": "Today",
    "Yesterday": "Yesterday",

    "Create Group": "Create Group",
    "Group name": "Group name",

    "Trash is empty": "Trash is empty",
    "Deleted notes will appear here.": "Deleted notes will appear here.",
    "No archived notes": "No archived notes",
    "Archived notes will appear here.": "Archived notes will appear here.",
    "No results found": "No results found",
    "Try searching with different keywords.": "Try searching with different keywords.",
    "No notes yet": "No notes yet",
    "Create your first note to get started.": "Create your first note to get started.",
    "No additional text": "No additional text",
    "Search notes": "Search notes",
    "Recent Notes": "Recent Notes",
    "Start typing to search your notes.": "Start typing to search your notes.",

    "Search Results": "Search Results",
    "Pinned Notes": "Pinned Notes",
    "Archive": "Archive",
    "Trash": "Trash",
    "All Notes": "All Notes",
    "Group Notes": "Group Notes",
    

    "Delete Account": "Delete Account",
    "Delete my account": "Delete my account",
    "Are you sure you want to delete your account?":
      "Are you sure you want to delete your account?",

    "English": "English",
    "Hindi": "Hindi",
    "Welcome to NotePad": "Welcome to NotePad",
    "Let’s set up your workspace": "Let’s set up your workspace",
    "Tell us a little about yourself so we can personalize NotePad for you.": "Tell us a little about yourself so we can personalize NotePad for you.",
    "Profile photo": "Profile photo",
    "Your name": "Your name",
    "Enter your name": "Enter your name",
    "Continue": "Continue",
    "Back": "Back",
    "Saving...": "Saving...",
    "Personal Preferences": "Personal Preferences",
    "Choose what fits you best. You can change some preferences later.": "Choose what fits you best. You can change some preferences later.",
    "What do you do?": "What do you do?",
    "Select your role": "Select your role",
    "What will you use NotePad for?": "What will you use NotePad for?",
    "Select a use case": "Select a use case",
    "Student": "Student",
    "Designer": "Designer",
    "Developer": "Developer",
    "Founder": "Founder",
    "Writer / Creator": "Writer / Creator",
    "Teacher / Educator": "Teacher / Educator",
    "Researcher": "Researcher",
    "Other": "Other",
    "Work": "Work",
    "Study": "Study",
    "Personal notes": "Personal notes",
    "Project planning": "Project planning",
    "Journaling": "Journaling",
    "Writing & ideas": "Writing & ideas",
    "Everything you need": "Everything you need",
    "Your workspace is ready. Capture ideas, organize notes, and keep everything in one place.": "Your workspace is ready. Capture ideas, organize notes, and keep everything in one place.",
    "Start Writing": "Start Writing",
    "Step": "Step",
    "of": "of",
    "Please enter your name.": "Please enter your name.",
    "Please select your role.": "Please select your role.",
    "Please select a use case.": "Please select a use case.",
    "Unable to complete onboarding. Please try again.": "Unable to complete onboarding. Please try again.",

    "Share note": "Share note",
    "Anyone with this link can view this note.": "Anyone with this link can view this note.",
    "Note": "Note",
    "Share link": "Share link",
    "Copied": "Copied",
    "Copy link": "Copy link",
    "Link copied to clipboard": "Link copied to clipboard",
    "Edit Profile": "Edit Profile",
    "Change Photo": "Change Photo",
    "Please select a JPG, PNG, or WebP image.": "Please select a JPG, PNG, or WebP image.",
    "Profile image must be 2 MB or smaller.": "Profile image must be 2 MB or smaller.",
    "You are not logged in.": "You are not logged in.",
    "Unable to read image.": "Unable to read image.",
    "Avatar upload failed.": "Avatar upload failed.",
    "Unable to upload avatar.": "Unable to upload avatar.",
    "Display name": "Display name",
    "Email Id": "Email Id",
    "Your profile helps people recognize you in group chats.": "Your profile helps people recognize you in group chats.",
    "Help": "Help",
    "Create a group to organize your notes.": "Create a group to organize your notes.",
    "e.g. Work, Personal, Travel": "e.g. Work, Personal, Travel",
    "Groups help you organize related notes in one place.": "Groups help you organize related notes in one place.",
    "You can move notes between groups anytime.": "You can move notes between groups anytime.",
    "Creating...": "Creating...",
    "Create group": "Create group",
    "Heading 1": "Heading 1",
    "Heading 2": "Heading 2",
    "Heading 3": "Heading 3",
    "Heading 4": "Heading 4",
    "Heading 5": "Heading 5",
    "Heading 6": "Heading 6",
    "List item": "List item",
    "Toggle task": "Toggle task",
    "To-do": "To-do",
    "Quote": "Quote",
    "Write code...": "Write code...",
    "Write an important note...": "Write an important note...",
    "Collapse toggle": "Collapse toggle",
    "Expand toggle": "Expand toggle",
    "Toggle title": "Toggle title",
    "Click here and start writing...": "Click here and start writing...",
    "Start writing...": "Start writing...",
    "Type something...": "Type something...",
    "Text": "Text",
    "Just Start Writing": "Just Start Writing",
    "Large heading": "Large heading",
    "Medium heading": "Medium heading",
    "Small heading": "Small heading",
    "Small section heading": "Small section heading",
    "Smaller heading": "Smaller heading",
    "Smallest heading": "Smallest heading",
    "Bulleted List": "Bulleted List",
    "Create A Bulleted List": "Create A Bulleted List",
    "Numbered List": "Numbered List",
    "Create A Numbered List": "Create A Numbered List",
    "To-do List": "To-do List",
    "Create A Task List": "Create A Task List",
    "Add A Quote": "Add A Quote",
    "Code": "Code",
    "Add Code Block": "Add Code Block",
    "Callout": "Callout",
    "Highlight Info": "Highlight Info",
    "Elements": "Elements",
    "This note is empty.": "This note is empty.",
    "Activity": "Activity",
    "Edited by": "Edited by",
    "You": "You",
    "Created by": "Created by",
    "Share notes": "Share notes",
    "More options": "More options",
    "Unpin": "Unpin",
    "Pin": "Pin",
    "Unarchive": "Unarchive",
    "Import": "Import",
    "Export": "Export",
    "Move to Group": "Move to Group",
    "No groups found": "No groups found",
    "Remove from Group": "Remove from Group",
    "Move to Trash": "Move to Trash",
    "No notes in this group": "No notes in this group",
    "Open sidebar": "Open sidebar",
    "Select a note from the list or create a new one to start writing.": "Select a note from the list or create a new one to start writing.",
    "Notes": "Notes",
    "Date created": "Date created",
    "Last edited": "Last edited",
    "Restore": "Restore",
    "Delete forever": "Delete forever",
    "India Standard Time": "India Standard Time",
    "Eastern Time": "Eastern Time",
    "Central Time": "Central Time",
    "Mountain Time": "Mountain Time",
    "Pacific Time": "Pacific Time",
    "London": "London",
    "Paris": "Paris",
    "Dubai": "Dubai",
    "Singapore": "Singapore",
    "Tokyo": "Tokyo",
    "UTC": "UTC",
    "Not available": "Not available",
    "Copy email": "Copy email",
    "Copy user ID": "Copy user ID",
    "Deleting...": "Deleting...",
    "Yes, delete account": "Yes, delete account",
    "Close settings": "Close settings",
    "Manage your preferences and account": "Manage your preferences and account",
    "Preferences": "Preferences",
    "Settings updated": "Settings updated",
    "Your session has expired. Please login again.": "Your session has expired. Please login again.",
    "Unable to update language. Please try again.": "Unable to update language. Please try again.",
    "Please login first": "Please login first",
    "Unable to create note": "Unable to create note",
    "Note created": "Note created",
    "Unable to delete note": "Unable to delete note",
    "Note deleted": "Note deleted",
    "Unable to update pin": "Unable to update pin",
    "Note pinned": "Note pinned",
    "Note unpinned": "Note unpinned",
    "Unable to move note to group": "Unable to move note to group",
    "Unable to remove note from group": "Unable to remove note from group",
    "Unable to archive note": "Unable to archive note",
    "Note archived": "Note archived",
    "Note restored": "Note restored",
    "Unable to share note": "Unable to share note",
    "Share link could not be created": "Share link could not be created",
    "Unable to restore note": "Unable to restore note",
    "Note permanently deleted": "Note permanently deleted",
    "Group name is required": "Group name is required",
    "Unable to create group": "Unable to create group",
    "Group created": "Group created",
    "Unable to create group. Please try again.": "Unable to create group. Please try again.",
    "Unable to rename group": "Unable to rename group",
    "Group renamed": "Group renamed",
    "Unable to delete group": "Unable to delete group",
    "Group deleted": "Group deleted",

    "Search all notes": "Search all notes",
    "Search by title or content": "Search by title or content",
    "Preview": "Preview",
    "Content": "Content",
    "Actions": "Actions",
    "Created": "Created",
    "Updated": "Updated",
    "No matching notes": "No matching notes",
    "All your notes in one place.": "All your notes in one place.",
    "Edited": "Edited",
    "Edited just now": "Edited just now",
    "m ago": "m ago",
    "h ago": "h ago",
    "d ago": "d ago",
    "More": "More",
    "Untitled Note": "Untitled Note",
  },

  hi: {
    "New Note": "नया नोट",
    "Search Notes": "नोट खोजें",
    "Archived": "संग्रहित",
    "Trash": "ट्रैश",
    "Pinned": "पिन किए गए",
    "Groups": "ग्रुप",
    "All Notes": "सभी नोट्स",

    "Settings": "सेटिंग्स",
    "Profile": "प्रोफ़ाइल",
    "Log out": "लॉग आउट",

    "Appearance": "दिखावट",
    "Theme": "थीम",
    "Choose how NotePad looks": "NotePad की दिखावट चुनें",
    "Language": "भाषा",
    "Select your preferred language": "अपनी पसंदीदा भाषा चुनें",
    "Time Zone": "समय क्षेत्र",
    "Used for dates and times": "दिनांक और समय के लिए उपयोग किया जाता है",

    "light": "लाइट",
    "dark": "डार्क",
    "system": "सिस्टम",

    "Save": "सहेजें",
    "Cancel": "रद्द करें",
    "Delete": "हटाएं",
    "Close": "बंद करें",
    "Create": "बनाएं",
    "Rename": "नाम बदलें",
    "Edit": "संपादित करें",
    "Share": "शेयर करें",
    "Copy": "कॉपी करें",

    "No notes": "कोई नोट नहीं",
    "No note selected": "कोई नोट चयनित नहीं",
    "Untitled": "बिना शीर्षक",

    "Today": "आज",
    "Yesterday": "कल",

    "Create Group": "ग्रुप बनाएं",
    "Group name": "ग्रुप का नाम",

    "Trash is empty": "ट्रैश खाली है",
    "Deleted notes will appear here.": "डिलीट किए गए नोट्स यहां दिखाई देंगे।",
    "No archived notes": "कोई संग्रहीत नोट नहीं",
    "Archived notes will appear here.": "संग्रहीत नोट्स यहां दिखाई देंगे।",
    "No results found": "कोई परिणाम नहीं मिला",
    "Try searching with different keywords.": "अलग-अलग कीवर्ड से खोजने का प्रयास करें।",
    "No notes yet": "अभी तक कोई नोट नहीं है",
    "Create your first note to get started.": "शुरू करने के लिए अपना पहला नोट बनाएं।",
    "No additional text": "कोई अतिरिक्त टेक्स्ट नहीं",
    "Search notes": "नोट खोजें",
    "Recent Notes": "हाल के नोट्स",
    "Start typing to search your notes.": "अपने नोट्स खोजने के लिए टाइप करना शुरू करें।",

    "Search Results": "खोज परिणाम",
    "Pinned Notes": "पिन किए गए नोट्स",
    "Archive": "संग्रहित",
    "Trash": "ट्रैश",
    "All Notes": "सभी नोट्स",
    "Group Notes": "ग्रुप नोट्स",

    "Delete Account": "अकाउंट हटाएं",
    "Delete my account": "मेरा अकाउंट हटाएं",
    "Are you sure you want to delete your account?":
      "क्या आप वाकई अपना अकाउंट हटाना चाहते हैं?",

    "English": "अंग्रेज़ी",
    "Hindi": "हिंदी",
    "Welcome to NotePad": "NotePad में आपका स्वागत है",
    "Let’s set up your workspace": "आइए आपका workspace सेट करते हैं",
    "Tell us a little about yourself so we can personalize NotePad for you.": "अपने बारे में थोड़ा बताएं ताकि हम NotePad को आपके लिए बेहतर बना सकें।",
    "Profile photo": "प्रोफ़ाइल फोटो",
    "Your name": "आपका नाम",
    "Enter your name": "अपना नाम दर्ज करें",
    "Continue": "जारी रखें",
    "Back": "वापस",
    "Saving...": "सेव हो रहा है...",
    "Personal Preferences": "व्यक्तिगत पसंद",
    "Choose what fits you best. You can change some preferences later.": "जो आपके लिए सही है उसे चुनें। कुछ पसंद आप बाद में बदल सकते हैं।",
    "What do you do?": "आप क्या करते हैं?",
    "Select your role": "अपनी भूमिका चुनें",
    "What will you use NotePad for?": "आप NotePad का उपयोग किस लिए करेंगे?",
    "Select a use case": "उपयोग का तरीका चुनें",
    "Student": "छात्र",
    "Designer": "डिज़ाइनर",
    "Developer": "डेवलपर",
    "Founder": "फाउंडर",
    "Writer / Creator": "लेखक / क्रिएटर",
    "Teacher / Educator": "शिक्षक / एजुकेटर",
    "Researcher": "रिसर्चर",
    "Other": "अन्य",
    "Work": "काम",
    "Study": "पढ़ाई",
    "Personal notes": "व्यक्तिगत नोट्स",
    "Project planning": "प्रोजेक्ट प्लानिंग",
    "Journaling": "जर्नलिंग",
    "Writing & ideas": "लेखन और आइडिया",
    "Everything you need": "आपको चाहिए सब कुछ",
    "Your workspace is ready. Capture ideas, organize notes, and keep everything in one place.": "आपका workspace तैयार है। आइडिया लिखें, नोट्स व्यवस्थित करें और सब कुछ एक जगह रखें।",
    "Start Writing": "लिखना शुरू करें",
    "Step": "स्टेप",
    "of": "में से",
    "Please enter your name.": "कृपया अपना नाम दर्ज करें।",
    "Please select your role.": "कृपया अपनी भूमिका चुनें।",
    "Please select a use case.": "कृपया उपयोग का तरीका चुनें।",
    "Unable to complete onboarding. Please try again.": "Onboarding पूरा नहीं हो सका। कृपया फिर कोशिश करें।",

    "Share note": "नोट शेयर करें",
    "Anyone with this link can view this note.": "इस लिंक वाला कोई भी व्यक्ति इस नोट को देख सकता है।",
    "Note": "नोट",
    "Share link": "शेयर लिंक",
    "Copied": "कॉपी हो गया",
    "Copy link": "लिंक कॉपी करें",
    "Link copied to clipboard": "लिंक क्लिपबोर्ड पर कॉपी हो गया",
    "Edit Profile": "प्रोफ़ाइल संपादित करें",
    "Change Photo": "फोटो बदलें",
    "Please select a JPG, PNG, or WebP image.": "कृपया JPG, PNG या WebP इमेज चुनें।",
    "Profile image must be 2 MB or smaller.": "प्रोफ़ाइल इमेज 2 MB या उससे छोटी होनी चाहिए।",
    "You are not logged in.": "आप लॉग इन नहीं हैं।",
    "Unable to read image.": "इमेज पढ़ी नहीं जा सकी।",
    "Avatar upload failed.": "प्रोफ़ाइल फोटो अपलोड नहीं हो सकी।",
    "Unable to upload avatar.": "प्रोफ़ाइल फोटो अपलोड नहीं हो सकी।",
    "Display name": "डिस्प्ले नाम",
    "Email Id": "ईमेल आईडी",
    "Your profile helps people recognize you in group chats.": "आपकी प्रोफ़ाइल लोगों को ग्रुप चैट में आपको पहचानने में मदद करती है।",
    "Help": "मदद",
    "Create a group to organize your notes.": "अपने नोट्स को व्यवस्थित करने के लिए ग्रुप बनाएं।",
    "e.g. Work, Personal, Travel": "जैसे Work, Personal, Travel",
    "Groups help you organize related notes in one place.": "ग्रुप संबंधित नोट्स को एक जगह व्यवस्थित करने में मदद करते हैं।",
    "You can move notes between groups anytime.": "आप किसी भी समय नोट्स को अलग-अलग ग्रुप में ले जा सकते हैं।",
    "Creating...": "बनाया जा रहा है...",
    "Create group": "ग्रुप बनाएं",
    "Heading 1": "शीर्षक 1",
    "Heading 2": "शीर्षक 2",
    "Heading 3": "शीर्षक 3",
    "Heading 4": "शीर्षक 4",
    "Heading 5": "शीर्षक 5",
    "Heading 6": "शीर्षक 6",
    "List item": "लिस्ट आइटम",
    "Toggle task": "टास्क बदलें",
    "To-do": "टू-डू",
    "Quote": "उद्धरण",
    "Write code...": "कोड लिखें...",
    "Write an important note...": "महत्वपूर्ण नोट लिखें...",
    "Collapse toggle": "टॉगल बंद करें",
    "Expand toggle": "टॉगल खोलें",
    "Toggle title": "टॉगल शीर्षक",
    "Click here and start writing...": "यहाँ क्लिक करें और लिखना शुरू करें...",
    "Start writing...": "लिखना शुरू करें...",
    "Type something...": "कुछ लिखें...",
    "Text": "टेक्स्ट",
    "Just Start Writing": "बस लिखना शुरू करें",
    "Large heading": "बड़ा शीर्षक",
    "Medium heading": "मध्यम शीर्षक",
    "Small heading": "छोटा शीर्षक",
    "Small section heading": "छोटा सेक्शन शीर्षक",
    "Smaller heading": "और छोटा शीर्षक",
    "Smallest heading": "सबसे छोटा शीर्षक",
    "Bulleted List": "बुलेटेड लिस्ट",
    "Create A Bulleted List": "बुलेटेड लिस्ट बनाएं",
    "Numbered List": "नंबर वाली लिस्ट",
    "Create A Numbered List": "नंबर वाली लिस्ट बनाएं",
    "To-do List": "टू-डू लिस्ट",
    "Create A Task List": "टास्क लिस्ट बनाएं",
    "Add A Quote": "उद्धरण जोड़ें",
    "Code": "कोड",
    "Add Code Block": "कोड ब्लॉक जोड़ें",
    "Callout": "कॉलआउट",
    "Highlight Info": "जानकारी हाइलाइट करें",
    "Elements": "एलिमेंट्स",
    "This note is empty.": "यह नोट खाली है।",
    "Activity": "गतिविधि",
    "Edited by": "संपादित किया",
    "You": "आप",
    "Created by": "बनाया",
    "Share notes": "नोट शेयर करें",
    "More options": "और विकल्प",
    "Unpin": "पिन हटाएं",
    "Pin": "पिन करें",
    "Unarchive": "अनआर्काइव करें",
    "Import": "इम्पोर्ट",
    "Export": "एक्सपोर्ट",
    "Move to Group": "ग्रुप में ले जाएं",
    "No groups found": "कोई ग्रुप नहीं मिला",
    "Remove from Group": "ग्रुप से हटाएं",
    "Move to Trash": "ट्रैश में ले जाएं",
    "No notes in this group": "इस ग्रुप में कोई नोट नहीं है",
    "Open sidebar": "साइडबार खोलें",
    "Select a note from the list or create a new one to start writing.": "लिखना शुरू करने के लिए कोई नोट चुनें या नया नोट बनाएं।",
    "Notes": "नोट्स",
    "Date created": "बनाने की तारीख",
    "Last edited": "अंतिम संपादन",
    "Restore": "रिस्टोर करें",
    "Delete forever": "हमेशा के लिए हटाएं",
    "India Standard Time": "भारत मानक समय",
    "Eastern Time": "ईस्टर्न टाइम",
    "Central Time": "सेंट्रल टाइम",
    "Mountain Time": "माउंटेन टाइम",
    "Pacific Time": "पैसिफिक टाइम",
    "London": "लंदन",
    "Paris": "पेरिस",
    "Dubai": "दुबई",
    "Singapore": "सिंगापुर",
    "Tokyo": "टोक्यो",
    "UTC": "UTC",
    "Not available": "उपलब्ध नहीं",
    "Copy email": "ईमेल कॉपी करें",
    "Copy user ID": "यूज़र आईडी कॉपी करें",
    "Deleting...": "डिलीट किया जा रहा है...",
    "Yes, delete account": "हां, अकाउंट हटाएं",
    "Close settings": "सेटिंग्स बंद करें",
    "Manage your preferences and account": "अपनी पसंद और अकाउंट मैनेज करें",
    "Preferences": "प्राथमिकताएं",
    "Settings updated": "सेटिंग्स अपडेट हो गईं",
    "Your session has expired. Please login again.": "आपका सत्र समाप्त हो गया है। कृपया फिर से लॉगिन करें।",
    "Unable to update language. Please try again.": "भाषा अपडेट नहीं हो सकी। कृपया फिर से प्रयास करें।",
    "Please login first": "कृपया पहले लॉग इन करें",
    "Unable to create note": "नोट बनाया नहीं जा सका",
    "Note created": "नोट बन गया",
    "Unable to delete note": "नोट डिलीट नहीं किया जा सका",
    "Note deleted": "नोट डिलीट हो गया",
    "Unable to update pin": "पिन अपडेट नहीं किया जा सका",
    "Note pinned": "नोट पिन कर दिया गया",
    "Note unpinned": "नोट से पिन हटा दिया गया",
    "Unable to move note to group": "नोट को ग्रुप में नहीं ले जाया जा सका",
    "Unable to remove note from group": "नोट को ग्रुप से नहीं हटाया जा सका",
    "Unable to archive note": "नोट आर्काइव नहीं किया जा सका",
    "Note archived": "नोट आर्काइव हो गया",
    "Note restored": "नोट रिस्टोर हो गया",
    "Unable to share note": "नोट शेयर नहीं किया जा सका",
    "Share link could not be created": "शेयर लिंक नहीं बनाया जा सका",
    "Unable to restore note": "नोट रिस्टोर नहीं किया जा सका",
    "Note permanently deleted": "नोट हमेशा के लिए डिलीट हो गया",
    "Group name is required": "ग्रुप का नाम जरूरी है",
    "Unable to create group": "ग्रुप बनाया नहीं जा सका",
    "Group created": "ग्रुप बन गया",
    "Unable to create group. Please try again.": "ग्रुप नहीं बनाया जा सका। कृपया फिर कोशिश करें।",
    "Unable to rename group": "ग्रुप का नाम बदला नहीं जा सका",
    "Group renamed": "ग्रुप का नाम बदल गया",
    "Unable to delete group": "ग्रुप डिलीट नहीं किया जा सका",
    "Group deleted": "ग्रुप डिलीट हो गया",

    "Search all notes": "सभी नोट्स खोजें",
    "Search by title or content": "शीर्षक या सामग्री से खोजें",
    "Preview": "प्रीव्यू",
    "Content": "सामग्री",
    "Actions": "एक्शन",
    "Created": "बनाया गया",
    "Updated": "अपडेट किया गया",
    "No matching notes": "कोई मिलान करने वाला नोट नहीं मिला",
    "All your notes in one place.": "आपके सभी नोट्स एक ही जगह पर।",
    "Edited": "संपादित",
    "Edited just now": "अभी संपादित किया गया",
    "m ago": "मिनट पहले",
    "h ago": "घंटे पहले",
    "d ago": "दिन पहले",
    "More": "और",
    "Untitled Note": "बिना शीर्षक नोट",
  },
};

const localeCache = new Map<string, Intl.DateTimeFormat>();
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

function getIntlLocale(language: AppLanguage): string {
  return language === "hi" ? "hi-IN" : "en-IN";
}

function getDateFormatter(
  timezone: string,
  language: AppLanguage
): Intl.DateTimeFormat {
  const cacheKey = `date|${language}|${timezone}`;
  const cached = localeCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(getIntlLocale(language), {
    ...dateFormatOptions,
    timeZone: timezone,
  });

  localeCache.set(cacheKey, formatter);
  return formatter;
}

function getTimeFormatter(
  timezone: string,
  language: AppLanguage
): Intl.DateTimeFormat {
  const cacheKey = `time|${language}|${timezone}`;
  const cached = localeCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(getIntlLocale(language), {
    ...timeFormatOptions,
    timeZone: timezone,
  });

  localeCache.set(cacheKey, formatter);
  return formatter;
}

export function translate(
  key: string,
  language: AppLanguage = "en"
): string {
  return translations[language]?.[key] ?? key;
}

export function setLocale(language: AppLanguage) {
  localStorage.setItem("creatorflow-language", language);
}

export function getLocale(): AppLanguage {
  const saved = localStorage.getItem("creatorflow-language");

  if (saved === "hi") {
    return "hi";
  }

  return "en";
}

export function formatDateInTimezone(
  date: string | Date,
  timezone: string,
  language: AppLanguage = "en"
): string {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return getDateFormatter(timezone, language).format(value);
}

export function formatTimeInTimezone(
  date: string | Date,
  timezone: string,
  language: AppLanguage = "en"
): string {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return getTimeFormatter(timezone, language).format(value);
}

export function useLocale() {
  const { settings } = useAppContext();

  const language: AppLanguage =
    settings.language === "hi" ? "hi" : "en";

  const timezone =
    settings.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Asia/Kolkata";

  const t = useCallback(
    (key: string) => translate(key, language),
    [language]
  );

  const formatDate = useCallback(
    (date: string | Date) =>
      formatDateInTimezone(date, timezone, language),
    [timezone, language]
  );

  const formatTime = useCallback(
    (date: string | Date) =>
      formatTimeInTimezone(date, timezone, language),
    [timezone, language]
  );

  return useMemo(
    () => ({
      language,
      timezone,
      t,
      formatDate,
      formatTime,
    }),
    [language, timezone, t, formatDate, formatTime]
  );
}