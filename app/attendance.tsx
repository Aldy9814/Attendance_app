import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AttendancePage() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [recognizedName, setRecognizedName] = useState("");
  const [recognizedNim, setRecognizedNim] = useState("");

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.defaultText}>
          Akses kamera dibutuhkan untuk absensi.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Izinkan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3,
          base64: false,
        });

        const formData = new FormData();
        formData.append("file", {
          uri: photo.uri,
          name: "attendance_face.jpg",
          type: "image/jpeg",
        } as any);

        // API
        const response = await fetch("http://10.36.14.6:8000/verify", {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const result = await response.json();

        if (result.status === "success") {
          setRecognizedName(result.nama);
          setRecognizedNim(result.nim);
          setModalVisible(true);
        } else if (result.status === "failed") {
          alert(`❌ GAGAL: Wajah tidak terdaftar.`);
        } else {
          alert(`⚠️ ERROR: ${result.message}`);
        }
      } catch (error) {
        console.error(error);
        alert("❌ KONEKSI GAGAL: Tidak terhubung ke server.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.cameraContainer} facing="front" ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            {/* BACK BUTTON */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* FACE GUIDE */}
          <View style={styles.faceGuide} />

          {/* ATTEND BUTTON */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.shutterButton,
                isProcessing && styles.shutterButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Absen Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* MODAL */}

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.modalTitle}>Absensi Berhasil!</Text>
            <Text style={styles.modalSubtitle}>Selamat datang,</Text>
            <Text style={styles.studentNameText}>{recognizedName}</Text>
            <Text style={styles.studentNameText}>{recognizedNim}</Text>

            <TouchableOpacity
              style={styles.okBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.okBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  btn: {
    padding: 10,
    backgroundColor: "#00529C",
    marginTop: 10,
    borderRadius: 8,
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  defaultText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 15,
  },

  cameraContainer: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },

  header: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },

  backBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  backText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  faceGuide: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    borderStyle: "dashed",
    marginTop: 50,
  },

  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },

  shutterButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },

  shutterButtonDisabled: {
    backgroundColor: "#A9A9A9",
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    elevation: 10,
  },
  successIcon: { fontSize: 50, marginBottom: 10 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  modalSubtitle: { fontSize: 16, color: "#666" },
  studentNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
    marginBottom: 25,
    textAlign: "center",
  },
  okBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  okBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
