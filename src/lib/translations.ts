export type Language = 'ko' | 'en'

export const translations = {
  ko: {
    // Navigation & Auth
    login: 'Login',
    logout: '로그아웃',
    account_delete: '계정 삭제',
    gmail_login: 'Gmail로 로그인',
    loading: '로딩...',
    
    // Plans
    free: '무료',
    pro: 'Pro',
    premium: 'Premium',
    upgrade_to_pro: 'Pro 플랜으로 업그레이드하시겠습니까?',
    upgraded_successfully: '🎉 Pro 플랜으로 성공적으로 업그레이드되었습니다!',
    
    // Sections
    todos: 'Todos',
    content_sections: 'Content Sections',
    videos: 'Videos',
    links: 'Links', 
    images: 'Images',
    notes: 'Notes',
    
    // Todo
    no_todos: 'No todos',
    add_new_todo: 'Add new todo...',
    today: 'Today',
    past: 'Past',
    show_history: 'Show History',
    hide_history: 'Hide History',
    history: 'History',
    repeat_options: '반복 설정',
    repeat_none: '반복 안함',
    repeat_weekly: '매주 반복',
    repeat_monthly: '매월 동일 날짜',
    repeat_yearly: '매년 동일 날짜',
    
    // Content
    no_videos: 'No videos yet',
    no_links: 'No links yet',
    no_images: 'No images yet', 
    no_notes: 'No notes yet',
    storage_limit_reached: 'Storage limit reached',
    delete_existing_or_upgrade: 'Delete existing items to add new ones, or',
    upgrade_to_pro_link: 'upgrade to Pro',
    
    // Mini Functions
    mini_functions: 'Mini Functions',
    preview_only: 'Preview Only',
    active: 'Active',
    
    // Weather
    weather_loading: 'Loading weather...',
    weather_error: 'Weather unavailable',
    
    // Footer
    all_rights_reserved: 'All rights reserved',
    contact: 'Contact',
    tagline: '모든 북마크를 한 곳에서',
    
    // Cookie Banner
    cookie_title: 'We use cookies to improve your experience',
    cookie_description: 'We use essential cookies for authentication and optional analytics cookies to understand how you use Koouk. You can choose which cookies to accept.',
    privacy_policy: 'Privacy Policy',
    cookie_policy: 'Cookie Policy',
    essential_only: 'Essential Only',
    accept_all: 'Accept All',
    
    // Account Deletion
    delete_account: 'Delete Account',
    access_denied: 'Access Denied',
    must_be_logged_in: 'You must be logged in to access this page.',
    go_home: 'Go Home',
    action_cannot_be_undone: 'This action cannot be undone. Please review the information below carefully.',
    what_will_be_deleted: 'What will be deleted:',
    account_info: 'Account Information',
    email: 'Email',
    name: 'Name',
    current_plan: 'Current Plan',
    export_data: 'Export Your Data (Recommended)',
    export_description: 'Before deleting your account, you can download a copy of your data for your records.',
    export_my_data: 'Export My Data',
    data_exported: '✓ Data Exported',
    cancel: 'Cancel',
    continue_to_delete: 'Continue to Delete',
    final_confirmation: '⚠️ Final Confirmation',
    permanent_action: 'This action is permanent and cannot be undone. All your data will be permanently deleted from our servers.',
    type_to_confirm: 'Type DELETE MY ACCOUNT to confirm:',
    understand_permanent: 'I understand that this action is permanent and all my data will be lost forever.',
    go_back: 'Go Back',
    delete_forever: 'Delete My Account Forever',
    deleting_account: 'Deleting Account...',
    need_help: 'Need Help?',
    having_issues: 'If you\'re having issues with Koouk or have questions before deleting your account, we\'re here to help.',
    contact_support: 'Contact Support',
    terms_of_service: 'Terms of Service'
  },
  en: {
    // Navigation & Auth
    login: 'Login',
    logout: 'Logout',
    account_delete: 'Delete Account',
    gmail_login: 'Sign in with Gmail',
    loading: 'Loading...',
    
    // Plans
    free: 'Free',
    pro: 'Pro',
    premium: 'Premium',
    upgrade_to_pro: 'Upgrade to Pro plan? (Demo: This will simulate upgrading to Pro with 500 items per type)',
    upgraded_successfully: '🎉 Successfully upgraded to Pro plan! You can now store 500 items per type.',
    
    // Sections
    todos: 'Todos',
    content_sections: 'Content Sections',
    videos: 'Videos',
    links: 'Links',
    images: 'Images', 
    notes: 'Notes',
    
    // Todo
    no_todos: 'No todos',
    add_new_todo: 'Add new todo...',
    today: 'Today',
    past: 'Past',
    show_history: 'Show History',
    hide_history: 'Hide History',
    history: 'History',
    repeat_options: 'Repeat Settings',
    repeat_none: 'No repeat',
    repeat_weekly: 'Weekly repeat',
    repeat_monthly: 'Monthly repeat (same date)',
    repeat_yearly: 'Yearly repeat (same date)',
    
    // Content
    no_videos: 'No videos yet',
    no_links: 'No links yet', 
    no_images: 'No images yet',
    no_notes: 'No notes yet',
    storage_limit_reached: 'Storage limit reached',
    delete_existing_or_upgrade: 'Delete existing items to add new ones, or',
    upgrade_to_pro_link: 'upgrade to Pro',
    
    // Mini Functions
    mini_functions: 'Mini Functions',
    preview_only: 'Preview Only',
    active: 'Active',
    
    // Weather
    weather_loading: 'Loading weather...',
    weather_error: 'Weather unavailable',
    
    // Footer
    all_rights_reserved: 'All rights reserved',
    contact: 'Contact',
    tagline: 'All your bookmarks in one place',
    
    // Cookie Banner
    cookie_title: 'We use cookies to improve your experience',
    cookie_description: 'We use essential cookies for authentication and optional analytics cookies to understand how you use Koouk. You can choose which cookies to accept.',
    privacy_policy: 'Privacy Policy',
    cookie_policy: 'Cookie Policy',
    essential_only: 'Essential Only',
    accept_all: 'Accept All',
    
    // Account Deletion
    delete_account: 'Delete Account',
    access_denied: 'Access Denied',
    must_be_logged_in: 'You must be logged in to access this page.',
    go_home: 'Go Home',
    action_cannot_be_undone: 'This action cannot be undone. Please review the information below carefully.',
    what_will_be_deleted: 'What will be deleted:',
    account_info: 'Account Information',
    email: 'Email',
    name: 'Name',
    current_plan: 'Current Plan',
    export_data: 'Export Your Data (Recommended)',
    export_description: 'Before deleting your account, you can download a copy of your data for your records.',
    export_my_data: 'Export My Data',
    data_exported: '✓ Data Exported',
    cancel: 'Cancel',
    continue_to_delete: 'Continue to Delete',
    final_confirmation: '⚠️ Final Confirmation',
    permanent_action: 'This action is permanent and cannot be undone. All your data will be permanently deleted from our servers.',
    type_to_confirm: 'Type DELETE MY ACCOUNT to confirm:',
    understand_permanent: 'I understand that this action is permanent and all my data will be lost forever.',
    go_back: 'Go Back',
    delete_forever: 'Delete My Account Forever',
    deleting_account: 'Deleting Account...',
    need_help: 'Need Help?',
    having_issues: 'If you\'re having issues with Koouk or have questions before deleting your account, we\'re here to help.',
    contact_support: 'Contact Support',
    terms_of_service: 'Terms of Service'
  }
}

export const getTranslation = (key: keyof typeof translations.ko, language: Language = 'ko') => {
  return translations[language][key] || translations.ko[key] || key
}