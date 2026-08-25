import Foundation

/// Honest mapping modes. `lidarMesh` is only valid when ARKit produced a mesh.
enum VeloraMappingMode: String {
    case none
    case cameraFrame = "camera-frame"
    case lidarMesh = "lidar-mesh"
}

struct VeloraMapperProbe {
    let ready: Bool
    let platform: String?
    let reason: String?
}

struct VeloraLiDARMesh {
    let source: String
    let format: String
    let data: Data
}

/// Injected into WKWebView as `window.VeloraNativeMapper`.
protocol VeloraNativeMapper {
    func probe() async -> VeloraMapperProbe
    func captureLiDARMesh() async throws -> VeloraLiDARMesh
}
