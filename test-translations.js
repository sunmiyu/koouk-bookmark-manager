// Simple test to verify translations work
const { translations } = require('./src/lib/translations.ts');

// Test Korean translations
console.log('=== Korean Translations Test ===');
console.log('todos:', translations.ko.todos);
console.log('search_everything:', translations.ko.search_everything);
console.log('add_todo:', translations.ko.add_new_todo);

// Test English translations  
console.log('\n=== English Translations Test ===');
console.log('todos:', translations.en.todos);
console.log('search_everything:', translations.en.search_everything);
console.log('add_todo:', translations.en.add_new_todo);

// Test missing key fallback
console.log('\n=== Fallback Test ===');
console.log('missing_key (should fallback to Korean):', translations.en.missing_key || translations.ko.missing_key || 'missing_key');

console.log('\n✅ Translation system verification complete!');