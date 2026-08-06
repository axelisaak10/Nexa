const { execSync } = require('child_process');

console.log('🚀 Iniciando creación de Release v1.0...');

try {
  // 1. Git tag locally
  try {
    execSync('git tag -a v1.0 -m "Release v1.0 - Ecosistema Nexa (PWA, Flutter Wearable)"', { stdio: 'inherit' });
    console.log('✅ Tag local v1.0 creado.');
  } catch (e) {
    console.log('ℹ️ El tag local v1.0 ya existe o no se pudo crear.');
  }

  // 2. Instructions to push
  console.log('\n=========================================');
  console.log('🎉 ¡Tag listo localmente!');
  console.log('Para subirlo a GitHub y completar la entrega:');
  console.log('👉 Ejecuta: git push origin v1.0');
  console.log('=========================================\n');
} catch (error) {
  console.error('❌ Error al procesar release:', error);
}
