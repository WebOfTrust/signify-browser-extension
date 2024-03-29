import { BounceAnimationSvg } from "@components/ui/animations";

export default function PopupArrow({
  size,
  scale = 4,
}: {
  size: number;
  scale?: number;
}) {
  return (
    <BounceAnimationSvg
      width={size * scale}
      height={size * scale}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 197.091 197.091"
    >
      <g>
        <g>
          <g>
            <path
              fill="currentColor"
              d="M32.131,184.928L32.131,184.928c-18.388,0-31.573-2.505-32.131-2.616l0.734-7.648
        c32.349,0,55.555-8.45,68.964-25.098c15.174-18.835,13.532-43.34,12.394-51.811H25.918l85.588-85.592l85.585,85.592h-53.976
        C136.315,173.487,70.922,184.928,32.131,184.928z M44.564,90.028h43.912l0.673,3.028c0.311,1.432,7.476,35.341-13.381,61.302
        c-8.425,10.475-20.113,18.041-34.94,22.651c42.867-1.882,90.753-18.714,94.861-83.362l0.229-3.618h42.527l-66.939-66.946
        L44.564,90.028z"
            />
          </g>
        </g>
      </g>
    </BounceAnimationSvg>
  );
}
