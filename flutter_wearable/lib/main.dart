import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

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
      home: const WatchAuthGuard(),
    );
  }
}

class WatchAuthGuard extends StatefulWidget {
  const WatchAuthGuard({super.key});

  @override
  State<WatchAuthGuard> createState() => _WatchAuthGuardState();
}

class _WatchAuthGuardState extends State<WatchAuthGuard> {
  bool _isAuthenticated = false;
  String _pin = '';
  final String _correctPin = '1234';

  void _handleKeyPress(String value) {
    setState(() {
      if (_pin.length < 4) {
        _pin += value;
      }
      if (_pin.length == 4) {
        _validatePin();
      }
    });
  }

  void _handleBackspace() {
    setState(() {
      if (_pin.isNotEmpty) {
        _pin = _pin.substring(0, _pin.length - 1);
      }
    });
  }

  void _handleClear() {
    setState(() {
      _pin = '';
    });
  }

  void _validatePin() {
    if (_pin == _correctPin) {
      setState(() {
        _isAuthenticated = true;
        _pin = '';
      });
      _showToast('Acceso Permitido');
    } else {
      setState(() {
        _pin = '';
      });
      _showToast('PIN Incorrecto');
    }
  }

  void _logout() {
    setState(() {
      _isAuthenticated = false;
      _pin = '';
    });
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
        ),
        duration: const Duration(seconds: 1),
        backgroundColor: const Color(0xFF1E1E1E),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFB8860B), width: 1),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isAuthenticated) {
      return WatchHomeScreen(onLogout: _logout);
    }

    final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      body: Center(
        child: Container(
          width: screenSize.width,
          height: screenSize.height,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF26201B), Color(0xFF0F0E0D)],
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 12),
              const Text(
                'NEXA ACCESO',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                  color: Color(0xFFB8860B),
                ),
              ),
              const SizedBox(height: 6),
              // Passcode dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 5),
                    width: 9,
                    height: 9,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: index < _pin.length ? const Color(0xFFC85A2A) : const Color(0xFF3A342E),
                      border: Border.all(
                        color: index < _pin.length ? const Color(0xFFC85A2A) : const Color(0xFF5A4E42),
                        width: 1,
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),
              // 3-Column Pinpad
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: GridView.count(
                    crossAxisCount: 3,
                    childAspectRatio: 1.35,
                    mainAxisSpacing: 3,
                    crossAxisSpacing: 4,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      _buildNumberBtn('1'),
                      _buildNumberBtn('2'),
                      _buildNumberBtn('3'),
                      _buildNumberBtn('4'),
                      _buildNumberBtn('5'),
                      _buildNumberBtn('6'),
                      _buildNumberBtn('7'),
                      _buildNumberBtn('8'),
                      _buildNumberBtn('9'),
                      // Row 4
                      Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: _handleClear,
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            alignment: Alignment.center,
                            child: const Text('C', style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      _buildNumberBtn('0'),
                      IconButton(
                        onPressed: _handleBackspace,
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

  Widget _buildNumberBtn(String val) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _handleKeyPress(val),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF26201B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF3E332A), width: 0.5),
          ),
          alignment: Alignment.center,
          child: Text(
            val,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
          ),
        ),
      ),
    );
  }
}

class WatchHomeScreen extends StatefulWidget {
  final VoidCallback onLogout;
  const WatchHomeScreen({super.key, required this.onLogout});

  @override
  State<WatchHomeScreen> createState() => _WatchHomeScreenState();
}

class _WatchHomeScreenState extends State<WatchHomeScreen> {
  List<dynamic> products = [];
  bool isLoading = true;
  int cartCount = 0;

  // Purchase authentication state
  bool _isAuthorizingPurchase = false;
  String _purchasePin = '';
  dynamic _pendingItem;

  @override
  void initState() {
    super.initState();
    fetchNexaProducts();
  }

  Future<void> fetchNexaProducts() async {
    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/api/products'),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          products = data['products'] ?? [];
          isLoading = false;
        });
      } else {
        loadFallbackProducts();
      }
    } catch (e) {
      loadFallbackProducts();
    }
  }

  void loadFallbackProducts() {
    setState(() {
      products = [
        {
          "nombre": "Bandeja Travertino",
          "precio": 95.0,
          "categoria": "OBJETOS",
          "icon": "🍽️"
        },
        {
          "nombre": "Mesa Auxiliar Ratán",
          "precio": 240.0,
          "categoria": "MUEBLES",
          "icon": "🛋️"
        },
        {
          "nombre": "Jarrón Ceniza",
          "precio": 85.0,
          "categoria": "CERÁMICA",
          "icon": "🏺"
        },
        {
          "nombre": "Manta Lino Lavado",
          "precio": 130.0,
          "categoria": "TEXTILES",
          "icon": "🧶"
        },
        {
          "nombre": "Lámpara Escritorio",
          "precio": 195.0,
          "categoria": "ILUMINACIÓN",
          "icon": "💡"
        }
      ];
      isLoading = false;
    });
  }

  String getProductIcon(String category) {
    final cat = category.toUpperCase();
    if (cat.contains('CERÁMICA')) return '🏺';
    if (cat.contains('TEXTIL')) return '🧶';
    if (cat.contains('ILUMINACIÓN')) return '💡';
    if (cat.contains('MUEBLE')) return '🛋️';
    return '🍽️';
  }

  void _initiatePurchase(dynamic item) {
    setState(() {
      _pendingItem = item;
      _purchasePin = '';
      _isAuthorizingPurchase = true;
    });
  }

  void _handlePurchasePinKeyPress(String value) {
    setState(() {
      if (_purchasePin.length < 4) {
        _purchasePin += value;
      }
      if (_purchasePin.length == 4) {
        _validatePurchasePin();
      }
    });
  }

  void _handlePurchasePinBackspace() {
    setState(() {
      if (_purchasePin.isNotEmpty) {
        _purchasePin = _purchasePin.substring(0, _purchasePin.length - 1);
      }
    });
  }

  void _handlePurchasePinClear() {
    setState(() {
      _purchasePin = '';
    });
  }

  void _validatePurchasePin() async {
    if (_purchasePin == '1234') {
      setState(() {
        _isAuthorizingPurchase = false;
        cartCount++;
      });
      _showConfirmation(context, _pendingItem['nombre']);
      
      // Save order in Supabase via API
      try {
        await http.post(
          Uri.parse('http://10.0.2.2:3000/api/orders'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({
            "id_usuario": 2, // Cliente Demo
            "total": _pendingItem['precio'],
            "metodo_pago": "Smartwatch (PIN Auth)",
            "direccion_envio": "Wear OS Device",
            "detalles": [
              {
                "id_producto": _pendingItem['id_producto'] ?? 1,
                "cantidad": 1,
                "precio_unitario": _pendingItem['precio']
              }
            ]
          }),
        );
      } catch (e) {
        print('Supabase log error: $e');
      }
    } else {
      setState(() {
        _purchasePin = '';
      });
      _showToast('PIN de Compra Incorrecto');
    }
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
        ),
        duration: const Duration(seconds: 1),
        backgroundColor: const Color(0xFF1E1E1E),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Container(
          width: screenSize.width,
          height: screenSize.height,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF2A2621),
                Color(0xFF121212),
                Color(0xFF0D0D0C),
              ],
            ),
          ),
          child: _isAuthorizingPurchase
              ? _buildPurchasePinPad()
              : Stack(
                  alignment: Alignment.center,
                  children: [
                    // Bezel
                    Positioned.fill(
                      child: Container(
                        margin: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFFB8860B).withOpacity(0.35),
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),

                    // Main catalog content
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 20),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Watch Header with Centered NEXA name & SALIR button under it (to avoid cutoffs)
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const SizedBox(height: 6),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Text(
                                    'N E X A',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 2,
                                      color: Color(0xFFF5F0EB),
                                    ),
                                  ),
                                  if (cartCount > 0) ...[
                                    const SizedBox(width: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFC85A2A),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '$cartCount',
                                        style: const TextStyle(fontSize: 7, color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 2),
                              GestureDetector(
                                onTap: widget.onLogout,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.red.withOpacity(0.4), width: 0.5),
                                  ),
                                  child: const Text(
                                    'CERRAR SESIÓN',
                                    style: TextStyle(fontSize: 6.5, color: Colors.redAccent, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                                  ),
                                ),
                              ),
                            ],
                          ),

                          // Carousel
                          Expanded(
                            child: isLoading
                                ? const Center(
                                    child: SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                        color: Color(0xFFC85A2A),
                                        strokeWidth: 2,
                                      ),
                                    ),
                                  )
                                : PageView.builder(
                                    itemCount: products.length,
                                    itemBuilder: (context, index) {
                                      final item = products[index];
                                      final category = item['categorias']?['nombre'] ?? item['categoria'] ?? 'OBJETOS';
                                      final icon = item['icon'] ?? getProductIcon(category);

                                      return Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const SizedBox(height: 2),
                                          Container(
                                            width: 42,
                                            height: 42,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF1E1E1E),
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                color: const Color(0xFFB8860B).withOpacity(0.6),
                                                width: 1,
                                              ),
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              icon,
                                              style: const TextStyle(fontSize: 20),
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            category.toString().toUpperCase(),
                                            style: const TextStyle(
                                              fontSize: 7,
                                              letterSpacing: 1.5,
                                              color: Color(0xFFB8860B),
                                              fontWeight: FontWeight.w800,
                                            ),
                                          ),
                                          const SizedBox(height: 1),
                                          Text(
                                            item['nombre'] ?? 'Producto',
                                            textAlign: TextAlign.center,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(height: 1),
                                          Text(
                                            '\$${item['precio']}',
                                            style: const TextStyle(
                                              fontSize: 11.5,
                                              fontWeight: FontWeight.w800,
                                              color: Color(0xFFC85A2A),
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Material(
                                            color: Colors.transparent,
                                            child: InkWell(
                                              onTap: () => _initiatePurchase(item),
                                              borderRadius: BorderRadius.circular(16),
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 14,
                                                  vertical: 4,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFC85A2A),
                                                  borderRadius: BorderRadius.circular(16),
                                                ),
                                                child: const Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Icon(Icons.lock_outline, size: 8, color: Colors.white),
                                                    SizedBox(width: 4),
                                                    Text(
                                                      'COMPRAR',
                                                      style: TextStyle(
                                                        fontSize: 8,
                                                        letterSpacing: 1,
                                                        color: Colors.white,
                                                        fontWeight: FontWeight.w900,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      );
                                    },
                                  ),
                          ),

                          // Swipe indicator
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.chevron_left_rounded,
                                size: 10,
                                color: Colors.grey.withOpacity(0.7),
                              ),
                              const Text(
                                'DESLIZA',
                                style: TextStyle(
                                  fontSize: 6.5,
                                  color: Colors.grey,
                                  letterSpacing: 1,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Icon(
                                Icons.chevron_right_rounded,
                                size: 10,
                                color: Colors.grey.withOpacity(0.7),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                        ],
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildPurchasePinPad() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 6),
          const Text(
            'PIN DE CONFIRMACIÓN',
            style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFFB8860B), letterSpacing: 0.5),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (index) {
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: index < _purchasePin.length ? const Color(0xFFC85A2A) : const Color(0xFF3A342E),
                ),
              );
            }),
          ),
          const SizedBox(height: 6),
          Expanded(
            child: GridView.count(
              crossAxisCount: 3,
              childAspectRatio: 1.4,
              mainAxisSpacing: 2,
              crossAxisSpacing: 3,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildPurchaseNumberBtn('1'),
                _buildPurchaseNumberBtn('2'),
                _buildPurchaseNumberBtn('3'),
                _buildPurchaseNumberBtn('4'),
                _buildPurchaseNumberBtn('5'),
                _buildPurchaseNumberBtn('6'),
                _buildPurchaseNumberBtn('7'),
                _buildPurchaseNumberBtn('8'),
                _buildPurchaseNumberBtn('9'),
                // Row 4
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _handlePurchasePinClear,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      alignment: Alignment.center,
                      child: const Text('C', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
                _buildPurchaseNumberBtn('0'),
                IconButton(
                  onPressed: _handlePurchasePinBackspace,
                  icon: const Icon(Icons.backspace_outlined, size: 11, color: Color(0xFFC85A2A)),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              setState(() {
                _isAuthorizingPurchase = false;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey, width: 0.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('CANCELAR', style: TextStyle(fontSize: 7, color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 2),
        ],
      ),
    );
  }

  Widget _buildPurchaseNumberBtn(String val) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _handlePurchasePinKeyPress(val),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF26201B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF3E332A), width: 0.5),
          ),
          alignment: Alignment.center,
          child: Text(
            val,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
          ),
        ),
      ),
    );
  }

  void _showConfirmation(BuildContext context, String? name) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '¡Compra exitosa! $name',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        duration: const Duration(milliseconds: 1500),
        backgroundColor: const Color(0xFF1E1E1E),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 30),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFC85A2A), width: 1),
        ),
      ),
    );
  }
}
