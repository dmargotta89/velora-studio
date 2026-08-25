import ARKit
import Foundation

/// Real ARKit scene reconstruction. Compile and run on a Mac + LiDAR iPhone.
/// Do not call this from web; the Linux VM cannot build it.
final class ARKitLiDARMapper: NSObject, VeloraNativeMapper, ARSessionDelegate {
    private let session = ARSession()

    func probe() async -> VeloraMapperProbe {
        guard ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) else {
            return VeloraMapperProbe(
                ready: false,
                platform: nil,
                reason: "This device has no ARKit LiDAR scene reconstruction. Camera-only."
            )
        }
        return VeloraMapperProbe(ready: true, platform: "arkit-lidar", reason: nil)
    }

    func captureLiDARMesh() async throws -> VeloraLiDARMesh {
        let probe = await probe()
        guard probe.ready else {
            throw NSError(
                domain: "VeloraMapper",
                code: 1,
                userInfo: [NSLocalizedDescriptionKey: probe.reason ?? "LiDAR is not available."]
            )
        }

        let configuration = ARWorldTrackingConfiguration()
        configuration.sceneReconstruction = .mesh
        session.delegate = self
        session.run(configuration, options: [.resetTracking, .removeExistingAnchors])

        try await Task.sleep(nanoseconds: 2_000_000_000)

        let meshAnchors = session.currentFrame?.anchors.compactMap { $0 as? ARMeshAnchor } ?? []
        session.pause()

        guard !meshAnchors.isEmpty else {
            throw NSError(
                domain: "VeloraMapper",
                code: 2,
                userInfo: [NSLocalizedDescriptionKey: "ARKit did not produce a mesh. LiDAR capture failed."]
            )
        }

        // Host app should convert meshAnchors to USDZ/OBJ Data before crossing to JS.
        // Returning empty Data is forbidden — that would fake a mesh.
        throw NSError(
            domain: "VeloraMapper",
            code: 3,
            userInfo: [
                NSLocalizedDescriptionKey:
                    "Mesh export (USDZ/OBJ) must be completed in the iOS host. Not implemented in this scaffold."
            ]
        )
    }
}
