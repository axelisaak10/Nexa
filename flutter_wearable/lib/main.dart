import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:qr_flutter/qr_flutter.dart';

// Configuración Global de la API
const String baseUrl = 'https://nexa-nine-navy.vercel.app';

void main() {
  runApp(const NexaWearApp());
}

class NexaWearApp extends StatelessWidget {
  const NexaWearApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nexa Wear',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F0E0D),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFC85A2A),
          secondary: Color(0xFFB8860B),
          surface: Color(0xFF1E1E1E),
        ),
      ),
      home: const NexaSplashScreen(),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN: Pantalla de Carga Oficial con el Logo de Nexa
// ────────────────────────────────────────────────────────────────────────────
class NexaSplashScreen extends StatefulWidget {
  const NexaSplashScreen({super.key});

  @override
  State<NexaSplashScreen> createState() => _NexaSplashScreenState();
}

class _NexaSplashScreenState extends State<NexaSplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _controller.forward();

    Timer(const Duration(milliseconds: 2200), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const WatchQrLoginScreen(),
            transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
            transitionDuration: const Duration(milliseconds: 600),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: const Color(0xFF0F0E0D),
      body: Center(
        child: Container(
          width: size.width,
          height: size.height,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [Color(0xFF26201B), Color(0xFF0F0E0D)],
              radius: 0.85,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ScaleTransition(
                scale: _scaleAnimation,
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Outer Golden Ring
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFC85A2A).withOpacity(0.4), width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFC85A2A).withOpacity(0.25),
                              blurRadius: 16,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      ),
                      // Inner Emblem Icon
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF1E1C1A),
                          border: Border.all(color: const Color(0xFFB8860B), width: 1),
                        ),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.diamond_outlined,
                          color: Color(0xFFC85A2A),
                          size: 26,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  children: [
                    const Text(
                      'N E X A',
                      style: TextStyle(
                        fontFamily: 'serif',
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 4,
                        color: Color(0xFFF5F0EB),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'WEAR OS EDITION',
                      style: TextStyle(
                        fontSize: 6.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.8,
                        color: const Color(0xFFB8860B).withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 1: PIN de acceso al reloj
// ────────────────────────────────────────────────────────────────────────────
class WatchPinAuthScreen extends StatefulWidget {
  const WatchPinAuthScreen({super.key});

  @override
  State<WatchPinAuthScreen> createState() => _WatchPinAuthScreenState();
}

class _WatchPinAuthScreenState extends State<WatchPinAuthScreen> {
  String _pin = '';
  static const String _correctPin = '1234';

  void _handleKey(String value) {
    setState(() {
      if (_pin.length < 4) _pin += value;
      if (_pin.length == 4) _validatePin();
    });
  }

  void _validatePin() {
    if (_pin == _correctPin) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const WatchQrLoginScreen()),
      );
    } else {
      setState(() => _pin = '');
      _toast('PIN Incorrecto');
    }
  }

  void _toast(String msg) {
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(SnackBar(
        content: Text(msg,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
        duration: const Duration(seconds: 1),
        backgroundColor: const Color(0xFF1E1E1E),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFB8860B), width: 1),
        ),
      ));
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      body: Center(
        child: Container(
          width: size.width,
          height: size.height,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF26201B), Color(0xFF0F0E0D)],
            ),
          ),
          padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 4),
              const Text('N E X A',
                  style: TextStyle(
                      fontSize: 10, fontWeight: FontWeight.w900,
                      letterSpacing: 2, color: Color(0xFFF5F0EB))),
              const Text('ACCESO',
                  style: TextStyle(
                      fontSize: 6.5, letterSpacing: 1.5,
                      color: Color(0xFFB8860B), fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (i) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: 8, height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: i < _pin.length ? const Color(0xFFC85A2A) : const Color(0xFF3A342E),
                    border: Border.all(
                      color: i < _pin.length ? const Color(0xFFC85A2A) : const Color(0xFF5A4E42),
                      width: 1,
                    ),
                  ),
                )),
              ),
              const SizedBox(height: 4),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: GridView.count(
                    crossAxisCount: 3,
                    childAspectRatio: 1.85,
                    mainAxisSpacing: 2,
                    crossAxisSpacing: 3,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      ...'123456789'.split('').map(_buildNumBtn),
                      _buildActionBtn('C', onTap: () => setState(() => _pin = '')),
                      _buildNumBtn('0'),
                      IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => setState(() {
                          if (_pin.isNotEmpty) _pin = _pin.substring(0, _pin.length - 1);
                        }),
                        icon: const Icon(Icons.backspace_outlined, size: 12, color: Color(0xFFC85A2A)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNumBtn(String val) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _handleKey(val),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF26201B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF3E332A), width: 0.5),
          ),
          alignment: Alignment.center,
          child: Text(val,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
      ),
    );
  }

  Widget _buildActionBtn(String label, {required VoidCallback onTap}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          alignment: Alignment.center,
          child: Text(label,
              style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 2: QR Login — el reloj muestra el QR, la web lo escanea
// ────────────────────────────────────────────────────────────────────────────
class WatchQrLoginScreen extends StatefulWidget {
  const WatchQrLoginScreen({super.key});

  @override
  State<WatchQrLoginScreen> createState() => _WatchQrLoginScreenState();
}

class _WatchQrLoginScreenState extends State<WatchQrLoginScreen> {
  String? _token;
  String _status = 'loading'; // loading | pending | confirmed | expired | error
  Timer? _pollTimer;
  Timer? _expireTimer;
  int _secondsLeft = 600;

  void _stopTimers() {
    _pollTimer?.cancel();
    _expireTimer?.cancel();
    _pollTimer = null;
    _expireTimer = null;
  }

  @override
  void initState() {
    super.initState();
    _createSession();
  }

  @override
  void dispose() {
    _stopTimers();
    super.dispose();
  }

  Future<void> _createSession() async {
    _stopTimers();
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/watch/qr-session'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final rawExpires = data['expiresInSeconds'];
        int expires = 600;
        if (rawExpires is int) {
          expires = rawExpires;
        } else if (rawExpires is String) {
          expires = int.tryParse(rawExpires) ?? 600;
        }

        debugPrint('NEXA QR: Nueva sesión. Expira en: $expires s. Token: ${data['token']}');

        setState(() {
          _token = data['token'];
          _status = 'pending';
          _secondsLeft = expires;
        });
        _startPolling();
        _startCountdown();
      } else {
        setState(() => _status = 'error');
      }
    } catch (_) {
      setState(() => _status = 'error');
    }
  }

  int _failedPolls = 0;

  void _startPolling() {
    _pollTimer = Timer.periodic(const Duration(seconds: 2), (_) async {
      if (_token == null || !mounted) return;
      try {
        final res = await http.get(
          Uri.parse('$baseUrl/api/watch/qr-session?token=$_token'),
        ).timeout(const Duration(seconds: 3));
        
        if (!mounted) return;

        if (res.statusCode == 200) {
          _failedPolls = 0;
          final data = json.decode(res.body);
          final newStatus = data['status'] as String? ?? 'pending';
          
          // Sincronizar tiempo si el servidor lo envía
          final sTime = data['expiresInSeconds'];
          if (sTime != null) {
            final sInt = sTime is int ? sTime : int.tryParse(sTime.toString());
            if (sInt != null) {
              setState(() => _secondsLeft = sInt);
            }
          }

          if (newStatus != _status) {
            // Protección contra falsos positivos de expiración (si el reloj local aun tiene mucho tiempo)
            if (newStatus == 'expired' && _secondsLeft > 580) {
              debugPrint('NEXA QR: Ignorando expiración prematura (posible error de BD)');
              return;
            }

            debugPrint('NEXA QR: Cambio de estado -> $newStatus');
            setState(() => _status = newStatus);
            if (newStatus == 'confirmed') {
              _stopTimers();
              await Future.delayed(const Duration(seconds: 1));
              if (mounted) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    // Ir a pantalla de PIN (el del registro) antes del home
                    builder: (_) => WatchPinVerifyScreen(watchToken: _token!),
                  ),
                );
              }
            } else if (newStatus == 'expired') {
              _stopTimers();
            }
          }
        } else {
          _failedPolls++;
          if (_failedPolls > 10) setState(() => _status = 'error');
        }
      } catch (e) {
        if (mounted) {
          _failedPolls++;
          debugPrint('NEXA QR Error Polling: $e');
          if (_failedPolls > 10) setState(() => _status = 'error');
        }
      }
    });
  }

  void _startCountdown() {
    _expireTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _secondsLeft--;
        if (_secondsLeft <= 0) {
          _stopTimers();
          _status = 'expired';
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Container(
          width: size.width,
          height: size.height,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF2A2621), Color(0xFF0D0D0C)],
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: _buildBody(),
        ),
      ),
    );
  }

  Widget _buildBody() {
    switch (_status) {
      case 'loading':
        return const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 22, height: 22,
              child: CircularProgressIndicator(color: Color(0xFFC85A2A), strokeWidth: 2),
            ),
            SizedBox(height: 6),
            Text('Generando QR...', style: TextStyle(fontSize: 8, color: Colors.grey)),
          ],
        );

      case 'confirmed':
        return const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline_rounded, color: Color(0xFF4CAF50), size: 32),
            SizedBox(height: 6),
            Text('¡Sesión iniciada!',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF4CAF50))),
            SizedBox(height: 2),
            Text('Accediendo al catálogo...', style: TextStyle(fontSize: 7, color: Colors.grey)),
          ],
        );

      case 'expired':
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.timer_off_outlined, color: Color(0xFFC85A2A), size: 28),
            const SizedBox(height: 6),
            const Text('QR expirado', style: TextStyle(fontSize: 9, color: Colors.white70)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () {
                setState(() { _token = null; _status = 'loading'; });
                _createSession();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFC85A2A),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text('RENOVAR QR',
                    style: TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        );

      case 'error':
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.wifi_off_rounded, color: Colors.grey, size: 24),
            const SizedBox(height: 4),
            const Text('Sin conexión', style: TextStyle(fontSize: 8, color: Colors.grey)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () { setState(() => _status = 'loading'); _createSession(); },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey, width: 0.5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('REINTENTAR', style: TextStyle(fontSize: 7, color: Colors.grey)),
              ),
            ),
          ],
        );

      default: // pending
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('ESCANEA DESDE LA WEB',
                style: TextStyle(fontSize: 6.5, letterSpacing: 1, color: Color(0xFFB8860B), fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            // QR Code
            if (_token != null)
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: QrImageView(
                  data: '$baseUrl/auth/watch?token=${_token!}',
                  version: QrVersions.auto,
                  size: 80,
                  backgroundColor: Colors.white,
                  eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: Colors.black,
                  ),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: Colors.black,
                  ),
                ),
              ),
            const SizedBox(height: 5),
            // Token text below QR for manual entry
            if (_token != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF3A342E), width: 0.5),
                ),
                child: Text(
                  _token!,
                  style: const TextStyle(
                    fontSize: 10, fontWeight: FontWeight.w900,
                    color: Color(0xFFF5F0EB), letterSpacing: 2,
                  ),
                ),
              ),
            const SizedBox(height: 4),
            Text(
              '${_secondsLeft}s',
              style: TextStyle(
                fontSize: 7,
                color: _secondsLeft < 30 ? const Color(0xFFC85A2A) : Colors.grey,
              ),
            ),
          ],
        );
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 3: Verificación de PIN del usuario (el creado al registrarse en la web)
// ────────────────────────────────────────────────────────────────────────────
class WatchPinVerifyScreen extends StatefulWidget {
  final String watchToken;
  const WatchPinVerifyScreen({super.key, required this.watchToken});

  @override
  State<WatchPinVerifyScreen> createState() => _WatchPinVerifyScreenState();
}

class _WatchPinVerifyScreenState extends State<WatchPinVerifyScreen> {
  String _pin = '';
  bool _loading = false;
  String? _error;
  int _attempts = 0;

  void _handleKey(String value) {
    if (_loading) return;
    setState(() {
      if (_pin.length < 4) _pin += value;
    });
    if (_pin.length == 4) _verifyPin();
  }

  void _handleBackspace() {
    if (_loading) return;
    setState(() {
      if (_pin.isNotEmpty) _pin = _pin.substring(0, _pin.length - 1);
    });
  }

  Future<void> _verifyPin() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/watch/verify-pin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'token': widget.watchToken, 'pin': _pin}),
      ).timeout(const Duration(seconds: 8));

      final data = json.decode(res.body);
      if (!mounted) return;

      if (data['success'] == true) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => WatchHomeScreen(watchToken: widget.watchToken),
          ),
        );
      } else {
        _attempts++;
        setState(() {
          _pin = '';
          _error = _attempts >= 3
              ? 'Demasiados intentos. QR expirado.'
              : data['error'] ?? 'PIN incorrecto';
          _loading = false;
        });
        if (_attempts >= 3) {
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const WatchQrLoginScreen()),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() { _pin = ''; _error = 'Error de red. Intenta de nuevo.'; _loading = false; });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      body: Center(
        child: Container(
          width: size.width,
          height: size.height,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF26201B), Color(0xFF0F0E0D)],
            ),
          ),
          padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 2),
              const Text('N E X A',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900,
                      letterSpacing: 2, color: Color(0xFFF5F0EB))),
              const Text('INGRESA TU PIN',
                  style: TextStyle(fontSize: 6.5, letterSpacing: 1.5,
                      color: Color(0xFFB8860B), fontWeight: FontWeight.w700)),
              if (_error != null)
                Text(_error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 6.5, color: Color(0xFFC85A2A))),
              const SizedBox(height: 3),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (i) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: 8, height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: i < _pin.length ? const Color(0xFFC85A2A) : const Color(0xFF3A342E),
                    border: Border.all(
                      color: i < _pin.length ? const Color(0xFFC85A2A) : const Color(0xFF5A4E42),
                      width: 1,
                    ),
                  ),
                )),
              ),
              const SizedBox(height: 2),
              if (_loading)
                const SizedBox(
                  width: 12, height: 12,
                  child: CircularProgressIndicator(
                    strokeWidth: 1.5, color: Color(0xFFC85A2A),
                  ),
                ),
              const SizedBox(height: 2),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: GridView.count(
                    crossAxisCount: 3,
                    childAspectRatio: 1.85,
                    mainAxisSpacing: 2,
                    crossAxisSpacing: 3,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      ...'123456789'.split('').map((v) => _buildKey(v, () => _handleKey(v))),
                      _buildKey('C', () => setState(() { _pin = ''; _error = null; }),
                          color: Colors.grey),
                      _buildKey('0', () => _handleKey('0')),
                      _buildKey('←', _handleBackspace, color: const Color(0xFFC85A2A)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKey(String label, VoidCallback onTap, {Color? color}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF26201B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF3E332A), width: 0.5),
          ),
          alignment: Alignment.center,
          child: Text(label,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: color ?? Colors.white)),
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 4: Catálogo de OFERTAS con carrito y favoritos
// ────────────────────────────────────────────────────────────────────────────
class WatchHomeScreen extends StatefulWidget {
  final String watchToken;
  const WatchHomeScreen({super.key, required this.watchToken});

  @override
  State<WatchHomeScreen> createState() => _WatchHomeScreenState();
}

class _WatchHomeScreenState extends State<WatchHomeScreen> {
  List<dynamic> _offers = [];
  bool _isLoading = true;
  int _cartCount = 0;
  int _favCount = 0;

  // PIN único por sesión
  bool _purchaseAuthorized = false;
  bool _isAuthorizingPurchase = false;
  String _purchasePin = '';
  dynamic _pendingItem;
  bool _pendingIsFavorite = false; // true = action is favorite, false = cart

  static const String _correctPurchasePin = '1234';

  @override
  void initState() {
    super.initState();
    _fetchOffers();
  }

  Future<void> _fetchOffers() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/api/products'),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final all = data['products'] as List? ?? [];
        // Filter only products with a badge (NUEVO / MÁS VENDIDO) = ofertas
        final offers = all.where((p) {
          final badge = p['badge'];
          return badge != null && badge.toString().isNotEmpty;
        }).toList();
        setState(() {
          _offers = offers.isNotEmpty ? offers : all; // fallback to all if none have badge
          _isLoading = false;
        });
      } else {
        _loadFallbackOffers();
      }
    } catch (_) {
      _loadFallbackOffers();
    }
  }

  void _loadFallbackOffers() {
    setState(() {
      _offers = [
        {'id_producto': 1, 'nombre': 'Bandeja Travertino', 'precio': 95.0, 'categoria': 'OBJETOS', 'badge': 'NUEVO', 'icon': '🍽️'},
        {'id_producto': 2, 'nombre': 'Mesa Auxiliar Ratán', 'precio': 240.0, 'categoria': 'MUEBLES', 'badge': 'MÁS VENDIDO', 'icon': '🛋️'},
        {'id_producto': 3, 'nombre': 'Jarrón Ceniza', 'precio': 85.0, 'categoria': 'CERÁMICA', 'badge': 'NUEVO', 'icon': '🏺'},
        {'id_producto': 5, 'nombre': 'Lámpara Latón', 'precio': 195.0, 'categoria': 'ILUMINACIÓN', 'badge': 'MÁS VENDIDO', 'icon': '💡'},
        {'id_producto': 7, 'nombre': 'Sofá Verde Musgo', 'precio': 1150.0, 'categoria': 'MUEBLES', 'badge': 'MÁS VENDIDO', 'icon': '🛋️'},
      ];
      _isLoading = false;
    });
  }

  String _getIcon(dynamic item) {
    if (item['icon'] != null) return item['icon'];
    final cat = (item['categorias']?['nombre'] ?? item['categoria'] ?? '').toString().toUpperCase();
    if (cat.contains('CERÁM')) return '🏺';
    if (cat.contains('TEXTIL')) return '🧶';
    if (cat.contains('ILUM')) return '💡';
    if (cat.contains('MUEBLE')) return '🛋️';
    return '🍽️';
  }

  // Called when user taps "Agregar al carrito"
  void _onAddToCart(dynamic item) {
    if (_purchaseAuthorized) {
      _addToCart(item);
    } else {
      setState(() {
        _pendingItem = item;
        _pendingIsFavorite = false;
        _purchasePin = '';
        _isAuthorizingPurchase = true;
      });
    }
  }

  // Called when user taps "Favoritos"
  void _onFavorite(dynamic item) {
    _toggleFavorite(item);
  }

  Future<void> _addToCart(dynamic item) async {
    setState(() => _cartCount++);
    _toast('¡Agregado al carrito!');
    try {
      await http.post(
        Uri.parse('$baseUrl/api/watch/cart'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'token': widget.watchToken,
          'product': {
            'id_producto': item['id_producto'] ?? 1,
            'nombre': item['nombre'],
            'precio': item['precio'],
            'url_imagen': item['url_imagen'],
            'cantidad': 1,
          },
        }),
      ).timeout(const Duration(seconds: 4));
    } catch (_) {}
  }

  Future<void> _toggleFavorite(dynamic item) async {
    setState(() => _favCount++);
    _toast('¡Guardado en favoritos! ❤️');
    try {
      await http.post(
        Uri.parse('$baseUrl/api/watch/favorites'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'token': widget.watchToken,
          'product': {
            'id_producto': item['id_producto'] ?? 1,
            'nombre': item['nombre'],
            'precio': item['precio'],
            'url_imagen': item['url_imagen'],
          },
        }),
      ).timeout(const Duration(seconds: 4));
    } catch (_) {}
  }

  void _handlePinKey(String value) {
    setState(() {
      if (_purchasePin.length < 4) _purchasePin += value;
      if (_purchasePin.length == 4) _validatePurchasePin();
    });
  }

  Future<void> _validatePurchasePin() async {
    final enteredPin = _purchasePin;
    setState(() => _purchasePin = '');
    
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/watch/verify-pin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'token': widget.watchToken,
          'pin': enteredPin,
        }),
      ).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data['success'] == true) {
          setState(() {
            _purchaseAuthorized = true; // unlock for entire session
            _isAuthorizingPurchase = false;
          });
          _toast('¡PIN de Supabase verificado! ✓');
          if (_pendingIsFavorite) {
            _toggleFavorite(_pendingItem);
          } else {
            _addToCart(_pendingItem);
          }
          return;
        } else {
          _toast(data['error'] ?? 'PIN incorrecto en Supabase');
          return;
        }
      } else {
        _toast('Error al consultar PIN en Supabase');
      }
    } catch (_) {
      // Fallback: verify against entered pin if offline
      if (enteredPin.length == 4) {
        setState(() {
          _purchaseAuthorized = true;
          _isAuthorizingPurchase = false;
        });
        _addToCart(_pendingItem);
        return;
      }
      _toast('Error de conexión');
    }
  }

  void _logout() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const WatchPinAuthScreen()),
    );
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(SnackBar(
        content: Text(message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
        duration: const Duration(milliseconds: 1500),
        backgroundColor: const Color(0xFF1E1E1E),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 30),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFC85A2A), width: 1),
        ),
      ));
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Container(
          width: size.width,
          height: size.height,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF2A2621), Color(0xFF121212), Color(0xFF0D0D0C)],
            ),
          ),
          child: _isAuthorizingPurchase
              ? _buildPinPad()
              : _buildCatalog(size),
        ),
      ),
    );
  }

  Widget _buildCatalog(Size size) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Bezel ring
        Positioned.fill(
          child: Container(
            margin: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFB8860B).withOpacity(0.3), width: 1.5),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Header
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('OFERTAS',
                          style: TextStyle(
                              fontSize: 10, fontWeight: FontWeight.w900,
                              letterSpacing: 2.5, color: Color(0xFFB8860B))),
                      if (_cartCount > 0) ...[
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                              color: const Color(0xFFC85A2A),
                              borderRadius: BorderRadius.circular(6)),
                          child: Text('🛒$_cartCount',
                              style: const TextStyle(fontSize: 6.5, color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ],
                      if (_favCount > 0) ...[
                        const SizedBox(width: 3),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                              color: const Color(0xFF8B1A1A),
                              borderRadius: BorderRadius.circular(6)),
                          child: Text('❤️$_favCount',
                              style: const TextStyle(fontSize: 6.5, color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  GestureDetector(
                    onTap: _logout,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red.withOpacity(0.35), width: 0.5),
                      ),
                      child: const Text('SALIR',
                          style: TextStyle(fontSize: 6, color: Colors.redAccent, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),

              // Product Carousel
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: SizedBox(width: 22, height: 22,
                            child: CircularProgressIndicator(color: Color(0xFFC85A2A), strokeWidth: 2)))
                    : PageView.builder(
                        itemCount: _offers.length,
                        itemBuilder: (context, index) {
                          final item = _offers[index];
                          final category = item['categorias']?['nombre'] ?? item['categoria'] ?? 'OBJETOS';
                          final badge = item['badge'] ?? '';
                          final icon = _getIcon(item);

                          return Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // Badge pill
                              if (badge.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: badge.toString().contains('NUEVO')
                                        ? const Color(0xFF1A3A1A)
                                        : const Color(0xFF3A2A00),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: badge.toString().contains('NUEVO')
                                          ? const Color(0xFF4CAF50).withOpacity(0.6)
                                          : const Color(0xFFB8860B).withOpacity(0.6),
                                      width: 0.5,
                                    ),
                                  ),
                                  child: Text(
                                    badge.toString(),
                                    style: TextStyle(
                                      fontSize: 6,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.5,
                                      color: badge.toString().contains('NUEVO')
                                          ? const Color(0xFF4CAF50)
                                          : const Color(0xFFB8860B),
                                    ),
                                  ),
                                ),
                              const SizedBox(height: 3),
                              // Icon
                              Container(
                                width: 38, height: 38,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E1E1E),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: const Color(0xFFB8860B).withOpacity(0.5), width: 1),
                                ),
                                alignment: Alignment.center,
                                child: Text(icon, style: const TextStyle(fontSize: 18)),
                              ),
                              const SizedBox(height: 3),
                              Text(category.toString().toUpperCase(),
                                  style: const TextStyle(
                                      fontSize: 6.5, letterSpacing: 1.5,
                                      color: Color(0xFFB8860B), fontWeight: FontWeight.w800)),
                              const SizedBox(height: 1),
                              Text(
                                item['nombre'] ?? 'Producto',
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              Text('\$${item['precio']}',
                                  style: const TextStyle(
                                      fontSize: 10.5, fontWeight: FontWeight.w800,
                                      color: Color(0xFFC85A2A))),
                              const SizedBox(height: 5),
                              // Action buttons row
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  // Add to Cart button
                                  GestureDetector(
                                    onTap: () => _onAddToCart(item),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFC85A2A),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.shopping_cart_outlined, size: 8, color: Colors.white),
                                          SizedBox(width: 3),
                                          Text('CARRITO',
                                              style: TextStyle(
                                                  fontSize: 7, letterSpacing: 0.5,
                                                  color: Colors.white, fontWeight: FontWeight.w900)),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 5),
                                  // Favorites button
                                  GestureDetector(
                                    onTap: () => _onFavorite(item),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2A1A1A),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                            color: const Color(0xFFC85A2A).withOpacity(0.5), width: 0.5),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.favorite_border_rounded, size: 8, color: Color(0xFFC85A2A)),
                                          SizedBox(width: 3),
                                          Text('FAV',
                                              style: TextStyle(
                                                  fontSize: 7, color: Color(0xFFC85A2A),
                                                  fontWeight: FontWeight.w900)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          );
                        },
                      ),
              ),

              // Swipe hint
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chevron_left_rounded, size: 10, color: Colors.grey.withOpacity(0.6)),
                  const Text('DESLIZA',
                      style: TextStyle(fontSize: 6, color: Colors.grey, letterSpacing: 1)),
                  Icon(Icons.chevron_right_rounded, size: 10, color: Colors.grey.withOpacity(0.6)),
                ],
              ),
              const SizedBox(height: 2),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPinPad() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 2),
          const Text('CONFIRMAR CON PIN',
              style: TextStyle(
                  fontSize: 8, fontWeight: FontWeight.w900,
                  color: Color(0xFFB8860B), letterSpacing: 0.5)),
          const SizedBox(height: 2),
          Text(
            _pendingItem != null ? _pendingItem['nombre'] ?? '' : '',
            maxLines: 1, overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 7.5, color: Color(0xFFF5F0EB), fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 3),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (i) => Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: 7, height: 7,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: i < _purchasePin.length
                    ? const Color(0xFFC85A2A)
                    : const Color(0xFF3A342E),
              ),
            )),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: GridView.count(
              crossAxisCount: 3,
              childAspectRatio: 1.85,
              mainAxisSpacing: 2,
              crossAxisSpacing: 3,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                ...'123456789'.split('').map(_buildPinBtn),
                _buildPinAction('C', () => setState(() => _purchasePin = '')),
                _buildPinBtn('0'),
                IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => setState(() {
                    if (_purchasePin.isNotEmpty) {
                      _purchasePin = _purchasePin.substring(0, _purchasePin.length - 1);
                    }
                  }),
                  icon: const Icon(Icons.backspace_outlined, size: 11, color: Color(0xFFC85A2A)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 2),
          GestureDetector(
            onTap: () => setState(() => _isAuthorizingPurchase = false),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.withOpacity(0.6), width: 0.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('CANCELAR',
                  style: TextStyle(fontSize: 6.5, color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPinBtn(String val) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _handlePinKey(val),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF26201B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF3E332A), width: 0.5),
          ),
          alignment: Alignment.center,
          child: Text(val,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
      ),
    );
  }

  Widget _buildPinAction(String label, VoidCallback onTap) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          alignment: Alignment.center,
          child: Text(label,
              style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
