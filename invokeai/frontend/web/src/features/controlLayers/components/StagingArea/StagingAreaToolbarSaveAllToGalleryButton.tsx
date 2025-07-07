import { IconButton } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppSelector } from 'app/store/storeHooks';
import { withResultAsync } from 'common/util/result';
import { useCanvasSessionContext } from 'features/controlLayers/components/SimpleSession/context';
import { useCanvasManager } from 'features/controlLayers/contexts/CanvasManagerProviderGate';
import { selectAutoAddBoardId } from 'features/gallery/store/gallerySelectors';
import { toast } from 'features/toast/toast';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiFloppyDisksBold } from 'react-icons/pi';
import { copyImage } from 'services/api/endpoints/images';

const TOAST_ID = 'SAVE_ALL_STAGING_AREA_IMAGES_TO_GALLERY';

export const StagingAreaToolbarSaveAllToGalleryButton = memo(() => {
  const canvasManager = useCanvasManager();
  const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
  const ctx = useCanvasSessionContext();
  const items = useStore(ctx.$items);
  const progressData = useStore(ctx.$progressData);
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);

  const { t } = useTranslation();

  const saveAllImagesToGallery = useCallback(async () => {
    const imagesToSave = items
      .map((item) => progressData[item.item_id]?.imageDTO)
      .filter((imageDTO) => imageDTO !== null && imageDTO !== undefined);

    if (imagesToSave.length === 0) {
      toast({
        id: TOAST_ID,
        title: t('controlLayers.noImagesToSave'),
        status: 'warning',
      });
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    // Save all images in parallel
    const savePromises = imagesToSave.map(async (imageDTO) => {
      const result = await withResultAsync(async () => {
        await copyImage(imageDTO.image_name, {
          image_category: 'general',
          is_intermediate: false,
          board_id: autoAddBoardId === 'none' ? undefined : autoAddBoardId,
          silent: true,
        });
      });

      if (result.isOk()) {
        successCount++;
      } else {
        failureCount++;
      }
    });

    await Promise.all(savePromises);

    // Show appropriate toast based on results
    if (failureCount === 0) {
      toast({
        id: TOAST_ID,
        title: t('controlLayers.savedAllToGalleryOk', { count: successCount }),
        status: 'success',
      });
    } else if (successCount === 0) {
      toast({
        id: TOAST_ID,
        title: t('controlLayers.savedAllToGalleryError'),
        status: 'error',
      });
    } else {
      toast({
        id: TOAST_ID,
        title: t('controlLayers.savedAllToGalleryPartial', { success: successCount, failed: failureCount }),
        status: 'warning',
      });
    }
  }, [autoAddBoardId, items, progressData, t]);

  const hasImages = items.some((item) => progressData[item.item_id]?.imageDTO);

  return (
    <IconButton
      tooltip={t('controlLayers.stagingArea.saveAllToGallery')}
      aria-label={t('controlLayers.stagingArea.saveAllToGallery')}
      icon={<PiFloppyDisksBold />}
      onClick={saveAllImagesToGallery}
      colorScheme="invokeBlue"
      isDisabled={!hasImages || !shouldShowStagedImage}
    />
  );
});

StagingAreaToolbarSaveAllToGalleryButton.displayName = 'StagingAreaToolbarSaveAllToGalleryButton';
